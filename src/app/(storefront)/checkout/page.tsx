import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getStoreSettings } from "@/lib/site-content";
import { features } from "@/lib/env";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const store = await getStoreSettings();

  return (
    <>
      <PageHero eyebrow="Checkout" title="Almost there" />
      <CheckoutForm
        shippingKobo={store.shippingKobo ?? 0}
        paystackReady={features.paystack}
        testMode={features.paystackTestMode}
      />
    </>
  );
}
