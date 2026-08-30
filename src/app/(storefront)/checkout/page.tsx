import type { Metadata } from "next";
import { headers } from "next/headers";
import { PageHero } from "@/components/layout/page-hero";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getStoreSettings } from "@/lib/site-content";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { features } from "@/lib/env";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter your delivery details and pay securely via Paystack.",
  robots: { index: false },
};
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const store = await getStoreSettings();

  let defaultAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
  } | null = null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session) {
      defaultAddress = await prisma.address.findFirst({
        where: { userId: session.user.id, isDefault: true },
        select: { fullName: true, phone: true, street: true, city: true, state: true },
      });
    }
  } catch {
    /* not signed in / DB down — form just starts blank */
  }

  return (
    <>
      <PageHero eyebrow="Checkout" title="Almost there" />
      <CheckoutForm
        shippingKobo={store.shippingKobo ?? 0}
        paystackReady={features.paystack}
        testMode={features.paystackTestMode}
        defaultAddress={defaultAddress}
      />
    </>
  );
}
