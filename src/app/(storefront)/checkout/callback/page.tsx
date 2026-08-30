import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { InteractiveHoverLink } from "@/components/ui/interactive-hover-button";
import { ClearCartOnMount } from "@/components/checkout/clear-cart-on-mount";
import { verifyTransaction, PaystackNotConfigured } from "@/lib/paystack";
import { markOrderPaid } from "@/lib/checkout";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/format";

export const metadata: Metadata = {
  title: "Payment",
  description: "Your Timi's Jewels payment status.",
  robots: { index: false },
};
export const dynamic = "force-dynamic";

type State =
  | { kind: "success"; reference: string; totalKobo: number | null }
  | { kind: "failed"; reference: string | null }
  | { kind: "error"; message: string };

async function resolve(reference: string | undefined): Promise<State> {
  if (!reference) return { kind: "error", message: "No payment reference was provided." };
  try {
    const verify = await verifyTransaction(reference);
    if (verify.data.status === "success") {
      const result = await markOrderPaid(reference, reference).catch(() => null);
      return {
        kind: "success",
        reference,
        totalKobo: result?.order?.totalKobo ?? verify.data.amount ?? null,
      };
    }
    return { kind: "failed", reference };
  } catch (e) {
    if (e instanceof PaystackNotConfigured) {
      return { kind: "error", message: "Payments are not configured on this environment." };
    }
    // Verify call failed — fall back to whatever the DB already knows.
    const order = await prisma.order
      .findUnique({ where: { reference }, select: { status: true, totalKobo: true } })
      .catch(() => null);
    if (order?.status === "paid") {
      return { kind: "success", reference, totalKobo: order.totalKobo };
    }
    return { kind: "failed", reference };
  }
}

export default async function CheckoutCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const sp = await searchParams;
  const state = await resolve(sp.reference ?? sp.trxref);

  return (
    <>
      <PageHero eyebrow="Checkout" title="Payment" />
      <section className="mx-auto max-w-md px-4 pb-16 text-center sm:px-6">
        {state.kind === "success" && (
          <div className="rounded-2xl border border-border bg-card p-8">
            <ClearCartOnMount />
            <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
            <h2 className="mt-4 font-heading text-2xl">Payment confirmed</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Thank you! Your order <strong>{state.reference}</strong> is paid
              {state.totalKobo != null ? ` — ${formatNaira(state.totalKobo)}` : ""}. A receipt is on
              its way to your email.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <InteractiveHoverLink href="/track-order" className="w-full justify-center">
                Track your order
              </InteractiveHoverLink>
              <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground">
                Continue shopping
              </Link>
            </div>
          </div>
        )}

        {state.kind === "failed" && (
          <div className="rounded-2xl border border-border bg-card p-8">
            <XCircle className="mx-auto size-12 text-rose-deep" />
            <h2 className="mt-4 font-heading text-2xl">Payment not completed</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {state.reference ? (
                <>
                  We couldn&rsquo;t confirm a successful payment for <strong>{state.reference}</strong>.
                  Nothing has been charged. Your bag is still saved.
                </>
              ) : (
                "We couldn't confirm your payment. Nothing has been charged."
              )}
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <InteractiveHoverLink href="/checkout" className="w-full justify-center">
                Try again
              </InteractiveHoverLink>
              <Link href="/cart" className="text-sm text-muted-foreground hover:text-foreground">
                Back to bag
              </Link>
            </div>
          </div>
        )}

        {state.kind === "error" && (
          <div className="rounded-2xl border border-border bg-card p-8">
            <AlertCircle className="mx-auto size-12 text-amber-500" />
            <h2 className="mt-4 font-heading text-2xl">Something went wrong</h2>
            <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
            <div className="mt-6">
              <InteractiveHoverLink href="/cart" className="w-full justify-center">
                Back to bag
              </InteractiveHoverLink>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
