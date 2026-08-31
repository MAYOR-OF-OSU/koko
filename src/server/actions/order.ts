"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requirePermission } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { markOrderPaid, sendReceiptEmail } from "@/lib/checkout";
import { verifyTransaction, PaystackNotConfigured } from "@/lib/paystack";

const STATUSES = ["pending", "paid", "fulfilled", "cancelled"] as const;
export type OrderStatus = (typeof STATUSES)[number];

// Kept module-local — a "use server" file may only export async functions (and types).
const FULFILLMENT_STAGES = [
  "received",
  "packaged",
  "dispatched",
  "in_transit",
  "arriving",
  "ready_pickup",
  "delivered",
] as const;
export type FulfillmentStage = (typeof FULFILLMENT_STAGES)[number];

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const session = await requirePermission("orders:write");
  if (!STATUSES.includes(status)) throw new Error("Bad status");
  const order = await prisma.order.findUnique({
    where: { id },
    select: { reference: true, status: true, paystackRef: true },
  });
  if (!order) throw new Error("Order not found");

  // Flipping pending → paid via the dropdown also stamps paidAt + emails a receipt.
  if (status === "paid" && order.status === "pending") {
    await markOrderPaid(order.reference, order.paystackRef ?? "manual", {
      manual: !order.paystackRef,
      actorEmail: session.user.email,
    });
  } else {
    await prisma.order.update({ where: { id }, data: { status } });
    await logAudit({ action: "order.status", target: order.reference, meta: { status } });
  }
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

const overrideSchema = z.object({
  status: z.enum(STATUSES),
  reason: z.string().trim().min(3).max(400),
});

/**
 * Admin only — the "veto": force an order to any status regardless of the normal
 * flow, reconciling the payment fields and recording who changed it and why.
 * Reversing a paid/fulfilled order back to pending or cancelled drops its payment
 * stamps; the quick status dropdown must not do that silently.
 */
export async function overrideOrderStatus(
  id: string,
  input: z.input<typeof overrideSchema>,
): Promise<Result> {
  try {
    const session = await requireAdmin();
    const d = overrideSchema.parse(input);

    const order = await prisma.order.findUnique({
      where: { id },
      select: { reference: true, status: true, paidAt: true, paystackRef: true },
    });
    if (!order) return { ok: false, error: "Order not found" };
    if (order.status === d.status) return { ok: false, error: `Order is already ${d.status}.` };

    const note = `Admin override (${order.status} → ${d.status}): ${d.reason}`;
    const data: {
      status: OrderStatus;
      paymentNote: string;
      paidAt?: Date | null;
      paystackRef?: string | null;
    } = { status: d.status, paymentNote: note };

    if (d.status === "paid") {
      // Forcing paid — make the payment record coherent without emailing a receipt.
      data.paidAt = order.paidAt ?? new Date();
      data.paystackRef = order.paystackRef ?? "manual";
    } else if (order.status === "paid" || order.status === "fulfilled") {
      // Reversing a settled order — drop the payment stamps.
      data.paidAt = null;
      data.paystackRef = null;
    }

    await prisma.order.update({ where: { id }, data });
    await logAudit({
      action: "order.override",
      target: order.reference,
      meta: { from: order.status, to: d.status, reason: d.reason, by: session.user.email },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${id}`);
    revalidatePath("/track-order");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not override the order" };
  }
}

type VerifySummary = {
  status: string;
  amountKobo: number;
  gatewayResponse: string | null;
  paidAt: string | null;
  channel: string | null;
};
export type VerifyOrderResult =
  | { ok: true; resolved?: boolean; alreadyPaid?: boolean; mismatch?: boolean; verify: VerifySummary }
  | { ok: false; error: string };

/** Cashier / manager / admin — re-check a pending order against Paystack; auto-resolve on a
 * confirmed success with a matching amount. */
export async function verifyOrderPayment(id: string): Promise<VerifyOrderResult> {
  try {
    await requirePermission("orders:write");
    const order = await prisma.order.findUnique({
      where: { id },
      select: { reference: true, status: true, totalKobo: true },
    });
    if (!order) return { ok: false, error: "Order not found" };

    let v;
    try {
      v = await verifyTransaction(order.reference);
    } catch (e) {
      if (e instanceof PaystackNotConfigured) return { ok: false, error: "Paystack is not configured." };
      return { ok: false, error: "Couldn't reach Paystack — try again." };
    }
    const verify: VerifySummary = {
      status: v.data.status,
      amountKobo: v.data.amount,
      gatewayResponse: v.data.gateway_response,
      paidAt: v.data.paid_at,
      channel: v.data.channel,
    };
    await logAudit({
      action: "payment.verify",
      target: order.reference,
      meta: { status: v.data.status, amountKobo: v.data.amount },
    });

    if (order.status === "paid") return { ok: true, alreadyPaid: true, verify };

    if (v.data.status === "success") {
      if (v.data.amount !== order.totalKobo) {
        return { ok: true, resolved: false, mismatch: true, verify };
      }
      const { changed } = await markOrderPaid(order.reference, v.data.reference, {});
      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${id}`);
      return { ok: true, resolved: changed, verify };
    }
    return { ok: true, resolved: false, verify };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Verification failed" };
  }
}

/** Admin only — one-click "mark this payment successful" from the Payments list.
 * pending → paid: stamps paidAt, keeps the Paystack ref if there is one (else
 * "manual"), emails the receipt and writes an audit row. */
export async function markPaymentSuccessful(id: string): Promise<Result> {
  try {
    const session = await requireAdmin();
    const order = await prisma.order.findUnique({
      where: { id },
      select: { reference: true, status: true, paystackRef: true },
    });
    if (!order) return { ok: false, error: "Order not found" };
    if (order.status !== "pending") {
      return { ok: false, error: `This payment is already ${order.status}.` };
    }

    await markOrderPaid(order.reference, order.paystackRef ?? "manual", {
      manual: !order.paystackRef,
      actorEmail: session.user.email,
    });

    revalidatePath("/admin/payments");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/account/orders");
    revalidatePath("/track-order");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update the payment" };
  }
}

/** Admin only — force an order to paid for a payment confirmed off Paystack (bank transfer, etc). */
export async function resolveOrderPaymentManually(id: string, note: string): Promise<Result> {
  try {
    const session = await requireAdmin();
    const d = z.object({ note: z.string().trim().min(3).max(400) }).parse({ note });
    const order = await prisma.order.findUnique({
      where: { id },
      select: { reference: true, status: true },
    });
    if (!order) return { ok: false, error: "Order not found" };
    if (order.status !== "pending") return { ok: false, error: `Order is already ${order.status}.` };

    await markOrderPaid(order.reference, "manual", {
      manual: true,
      note: d.note,
      actorEmail: session.user.email,
    });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not resolve the order" };
  }
}

/** Cashier / manager / admin — re-send the customer receipt for an already-paid order. */
export async function resendReceipt(id: string): Promise<Result> {
  try {
    await requirePermission("orders:write");
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return { ok: false, error: "Order not found" };
    if (order.status !== "paid") return { ok: false, error: "Only paid orders have a receipt." };
    await sendReceiptEmail(order, { manual: order.paystackRef === "manual" });
    await logAudit({ action: "payment.receipt.resend", target: order.reference });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not resend the receipt" };
  }
}

const fulfillmentSchema = z.object({
  stage: z.enum(FULFILLMENT_STAGES),
  deliveryMethod: z.enum(["delivery", "pickup"]).optional(),
  note: z.string().max(400).optional(),
  estimatedReadyAt: z.string().optional(), // yyyy-mm-dd or datetime-local
});

type Result = { ok: true } | { ok: false; error: string };

/** Cashier / manager / admin — move an order along the delivery timeline. */
export async function updateOrderFulfillment(
  id: string,
  input: z.input<typeof fulfillmentSchema>,
): Promise<Result> {
  try {
    await requirePermission("orders:write");
    const d = fulfillmentSchema.parse(input);
    const eta = d.estimatedReadyAt ? new Date(d.estimatedReadyAt) : null;

    const order = await prisma.order.update({
      where: { id },
      data: {
        fulfillmentStage: d.stage,
        deliveryMethod: d.deliveryMethod ?? undefined,
        stageNote: d.note?.trim() || null,
        estimatedReadyAt: Number.isNaN(eta?.getTime()) ? null : eta,
        stageUpdatedAt: new Date(),
      },
      select: { reference: true, userId: true },
    });

    await logAudit({
      action: "order.fulfilment",
      target: order.reference,
      meta: { stage: d.stage, method: d.deliveryMethod ?? null, note: d.note ?? null },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${id}`);
    revalidatePath("/track-order");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update the order" };
  }
}

const lookupSchema = z.object({
  reference: z.string().trim().min(3).max(40),
  email: z.string().trim().email(),
});

export type TrackedOrder = {
  reference: string;
  email: string;
  createdAt: string;
  status: string;
  fulfillmentStage: FulfillmentStage;
  deliveryMethod: "delivery" | "pickup";
  stageNote: string | null;
  estimatedReadyAt: string | null;
  stageUpdatedAt: string | null;
  address: Record<string, string>;
  items: { name: string; qty: number }[];
};

/** Public — look an order up by reference + email for the guest tracking page. */
export async function lookupOrder(
  input: z.input<typeof lookupSchema>,
): Promise<{ ok: true; order: TrackedOrder } | { ok: false; error: string }> {
  try {
    const d = lookupSchema.parse(input);
    const order = await prisma.order.findFirst({
      where: {
        reference: { equals: d.reference, mode: "insensitive" },
        email: { equals: d.email, mode: "insensitive" },
      },
      include: { items: { select: { name: true, qty: true } } },
    });
    if (!order) return { ok: false, error: "No order matches that reference and email." };

    return {
      ok: true,
      order: {
        reference: order.reference,
        email: order.email,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        fulfillmentStage: order.fulfillmentStage as FulfillmentStage,
        deliveryMethod: order.deliveryMethod as "delivery" | "pickup",
        stageNote: order.stageNote,
        estimatedReadyAt: order.estimatedReadyAt?.toISOString() ?? null,
        stageUpdatedAt: order.stageUpdatedAt?.toISOString() ?? null,
        address: (order.shippingAddress ?? {}) as Record<string, string>,
        items: order.items,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not look up the order" };
  }
}
