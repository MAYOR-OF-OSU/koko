import "server-only";
import type { Order, OrderItem } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { sendMail } from "@/lib/mail";
import { getStoreSettings } from "@/lib/site-content";
import { formatNaira, formatDate } from "@/lib/format";

type OrderWithItems = Order & { items: OrderItem[] };

/** Customer receipt + a store-inbox notification. Used on the paid transition and by "resend". */
export async function sendReceiptEmail(order: OrderWithItems, opts?: { manual?: boolean }) {
  const store = await getStoreSettings();
  const addr = (order.shippingAddress ?? {}) as Record<string, string>;
  const address =
    [addr.fullName, addr.street, addr.city, addr.state, addr.country, addr.phone]
      .filter(Boolean)
      .join(", ") || "—";
  const lines = order.items
    .map((i) => `${i.qty}× ${i.name} — ${formatNaira(i.unitPriceKobo * i.qty)}`)
    .join("<br>");

  await sendMail({
    to: order.email,
    subject: `Payment received — ${order.reference}`,
    html: `<p>Thank you! We've received payment for order <strong>${order.reference}</strong> placed ${formatDate(
      order.createdAt,
    )}.</p>
      ${opts?.manual ? `<p><em>Payment confirmed by our team${order.paymentNote ? ` — ${order.paymentNote}` : ""}.</em></p>` : ""}
      <p>${lines}</p>
      <p>Subtotal: ${formatNaira(order.subtotalKobo)}<br>
      Shipping: ${formatNaira(order.shippingKobo)}<br>
      <strong>Total: ${formatNaira(order.totalKobo)}</strong></p>
      <p>Ship to: ${address}</p>
      <p>Track your order any time at ${store.name} with your reference and this email address.</p>`,
    text: `Payment received for ${order.reference}. Total ${formatNaira(order.totalKobo)}. Ship to: ${address}.`,
  }).catch(() => {});

  await sendMail({
    to: store.email,
    subject: `${opts?.manual ? "Order marked paid (manual)" : "New paid order"} — ${order.reference}`,
    html: `<p>${order.reference} is paid — ${formatNaira(order.totalKobo)} from ${order.email}.${
      opts?.manual ? ` Confirmed manually${order.paymentNote ? `: ${order.paymentNote}` : ""}.` : ""
    }</p>`,
    text: `${order.reference} paid — ${formatNaira(order.totalKobo)} from ${order.email}.`,
  }).catch(() => {});
}

/**
 * Idempotently mark a pending order paid. Safe to call from the Paystack
 * callback, the webhook, the manual-resolve action and the status dropdown —
 * the status flip + receipt + audit row only happen on the actual transition.
 */
export async function markOrderPaid(
  reference: string,
  paystackRef: string,
  opts?: { manual?: boolean; note?: string | null; actorEmail?: string | null },
) {
  const res = await prisma.order.updateMany({
    where: { reference, status: "pending" },
    data: {
      status: "paid",
      paystackRef,
      paidAt: new Date(),
      ...(opts?.note ? { paymentNote: opts.note } : {}),
    },
  });

  const order = await prisma.order.findUnique({
    where: { reference },
    include: { items: true },
  });

  const changed = res.count > 0 && !!order;
  if (changed && order) {
    await logAudit({
      action: opts?.manual ? "payment.manual" : "checkout.paid",
      target: reference,
      meta: { totalKobo: order.totalKobo, note: opts?.note ?? null, by: opts?.actorEmail ?? null },
    });
    await sendReceiptEmail(order, { manual: opts?.manual });
  }

  return { order, changed };
}
