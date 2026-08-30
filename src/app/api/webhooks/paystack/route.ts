import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { env } from "@/lib/env";
import { markOrderPaid } from "@/lib/checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Paystack webhook. Inert until a secret key is set. Verifies the
 * `x-paystack-signature` HMAC (Paystack signs with the secret key), then marks
 * the matching order paid — idempotent with the /checkout/callback path.
 */
export async function POST(request: Request) {
  const secret = env.PAYSTACK_WEBHOOK_SECRET || env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "disabled" }, { status: 503 });

  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  if (!signature || signature !== expected) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as { event: string; data: { reference: string } };
  if (event.event === "charge.success" && event.data?.reference) {
    await markOrderPaid(event.data.reference, event.data.reference).catch(() => null);
  }

  return NextResponse.json({ received: true });
}
