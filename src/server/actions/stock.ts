"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin-guard";
import { getStoreSettings } from "@/lib/site-content";
import { sendMail } from "@/lib/mail";
import { logAudit } from "@/lib/audit";

type Result = { ok: true } | { ok: false; error: string };

function bump() {
  revalidatePath("/admin/stock");
  revalidatePath("/admin/alerts");
  revalidatePath("/admin/products");
  revalidatePath("/admin", "page");
}

/** Manager/admin only — set the on-hand count for a single variant. */
export async function saveStock(variantId: string, stock: number): Promise<Result> {
  try {
    await requirePermission("stock:write");
    const n = z.coerce.number().int().min(0).parse(stock);
    const v = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: n },
      select: { name: true, product: { select: { name: true } } },
    });
    await logAudit({
      action: "stock.save",
      target: `${v.product.name} — ${v.name}`,
      meta: { stock: n },
    });
    bump();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save stock" };
  }
}

const alertSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  note: z.string().max(400).optional(),
});

/** Any staff role — flag a product/variant as running low for the admin. */
export async function raiseStockAlert(input: z.input<typeof alertSchema>): Promise<Result> {
  try {
    const session = await requirePermission("alerts:raise");
    const d = alertSchema.parse(input);

    const product = await prisma.product.findUnique({
      where: { id: d.productId },
      select: { name: true, variants: { select: { id: true, name: true, stock: true } } },
    });
    if (!product) return { ok: false, error: "Product not found" };

    const variant = d.variantId ? product.variants.find((v) => v.id === d.variantId) : undefined;
    const stock = variant ? variant.stock : product.variants.reduce((n, v) => n + v.stock, 0);

    // De-dupe: don't stack an identical open alert.
    const existing = await prisma.stockAlert.findFirst({
      where: {
        productId: d.productId,
        variantName: variant?.name ?? null,
        status: "open",
      },
    });
    if (existing) return { ok: false, error: "There's already an open alert for this item." };

    await prisma.stockAlert.create({
      data: {
        productId: d.productId,
        productName: product.name,
        variantName: variant?.name ?? null,
        stock,
        note: d.note || null,
        raisedById: session.user.id,
        raisedBy: session.user.email,
      },
    });

    const store = await getStoreSettings();
    await sendMail({
      to: store.email,
      subject: `Low stock: ${product.name}${variant ? ` (${variant.name})` : ""}`,
      html: `<p><strong>${session.user.email}</strong> flagged low stock.</p>
        <p>${product.name}${variant ? ` — ${variant.name}` : ""}: <strong>${stock}</strong> left.</p>
        ${d.note ? `<p>Note: ${d.note}</p>` : ""}`,
      text: `${session.user.email} flagged low stock — ${product.name}${
        variant ? ` (${variant.name})` : ""
      }: ${stock} left.${d.note ? ` Note: ${d.note}` : ""}`,
    });

    await logAudit({
      action: "stock.alert.raise",
      target: `${product.name}${variant ? ` — ${variant.name}` : ""}`,
      meta: { stock, note: d.note ?? null },
    });

    bump();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not raise the alert" };
  }
}

/** Manager/admin — mark an alert handled. */
export async function resolveStockAlert(id: string): Promise<Result> {
  try {
    await requirePermission("alerts:resolve");
    const a = await prisma.stockAlert.update({
      where: { id },
      data: { status: "resolved", resolvedAt: new Date() },
      select: { productName: true, variantName: true },
    });
    await logAudit({
      action: "stock.alert.resolve",
      target: `${a.productName}${a.variantName ? ` — ${a.variantName}` : ""}`,
    });
    bump();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not resolve" };
  }
}
