import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { paystackEnabled, initializeTransaction } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getStoreSettings } from "@/lib/site-content";
import { getProduct } from "@/lib/mock-data";
import { logAudit } from "@/lib/audit";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  customer: z.object({
    firstName: z.string().trim().min(1).max(60),
    lastName: z.string().trim().min(1).max(60),
    email: z.string().trim().email(),
    phone: z.string().trim().min(6).max(30),
  }),
  address: z.object({
    street: z.string().trim().min(3).max(160),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
  }),
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1),
        variant: z.string().trim().max(80).optional(),
        qty: z.coerce.number().int().min(1).max(20),
      }),
    )
    .min(1),
});

function newReference() {
  return `TJ-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request) {
  if (!paystackEnabled) {
    return NextResponse.json(
      { error: "Online payments are not enabled yet.", code: "PAYSTACK_DISABLED" },
      { status: 503 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the form and your bag, then try again." }, { status: 400 });
  }
  const { customer, address, items } = parsed.data;

  // Recompute every line server-side — never trust client prices.
  const dbProducts = await prisma.product
    .findMany({
      where: { slug: { in: [...new Set(items.map((i) => i.slug))] } },
      select: { id: true, slug: true, name: true, priceKobo: true },
    })
    .catch(() => []);
  const bySlug = new Map(dbProducts.map((p) => [p.slug, p]));

  const orderItems: {
    productId: string | null;
    name: string;
    unitPriceKobo: number;
    qty: number;
  }[] = [];

  for (const line of items) {
    const db = bySlug.get(line.slug);
    const mock = getProduct(line.slug);
    const priceKobo = db?.priceKobo ?? mock?.priceKobo;
    const name = db?.name ?? mock?.name;
    if (!priceKobo || !name) {
      return NextResponse.json({ error: `Unknown item: ${line.slug}` }, { status: 400 });
    }
    orderItems.push({
      productId: db?.id ?? null,
      name: line.variant ? `${name} — ${line.variant}` : name,
      unitPriceKobo: priceKobo,
      qty: line.qty,
    });
  }

  const subtotalKobo = orderItems.reduce((n, i) => n + i.unitPriceKobo * i.qty, 0);
  const shippingKobo = (await getStoreSettings()).shippingKobo ?? 0;
  const totalKobo = subtotalKobo + shippingKobo;

  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  const reference = newReference();

  try {
    await prisma.order.create({
      data: {
        reference,
        status: "pending",
        email: customer.email,
        subtotalKobo,
        shippingKobo,
        totalKobo,
        userId: session?.user.id ?? null,
        shippingAddress: {
          fullName: `${customer.firstName} ${customer.lastName}`.trim(),
          phone: customer.phone,
          street: address.street,
          city: address.city,
          state: address.state,
          country: "Nigeria",
        },
        items: { create: orderItems },
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not create your order. Please try again." }, { status: 500 });
  }

  try {
    const init = await initializeTransaction({
      email: customer.email,
      amountKobo: totalKobo,
      reference,
      callbackUrl: `${env.NEXT_PUBLIC_SITE_URL}/checkout/callback`,
    });
    await logAudit({ action: "checkout.init", target: reference, meta: { totalKobo } });
    return NextResponse.json({ authorizationUrl: init.data.authorization_url, reference });
  } catch {
    // Leave the pending order in place; the shopper can retry.
    return NextResponse.json({ error: "Payment could not be started. Please try again." }, { status: 502 });
  }
}
