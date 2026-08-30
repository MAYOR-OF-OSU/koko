"use client";

import * as React from "react";
import Link from "next/link";
import { Info, Loader2, ShieldCheck } from "@/components/ui/icon";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { useCart, selectSubtotal } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";

type Values = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
};

export function CheckoutForm({
  shippingKobo,
  paystackReady,
  testMode,
  defaultAddress,
}: {
  shippingKobo: number;
  paystackReady: boolean;
  testMode: boolean;
  defaultAddress?: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
  } | null;
}) {
  const { data: session } = useSession();
  const { lines } = useCart();
  const subtotal = useCart(selectSubtotal);
  const shipping = lines.length ? shippingKobo : 0;
  const total = subtotal + shipping;

  const [v, setV] = React.useState<Values>(() => {
    const [first, ...rest] = (defaultAddress?.fullName ?? "").split(" ");
    return {
      firstName: first ?? "",
      lastName: rest.join(" "),
      email: "",
      phone: defaultAddress?.phone ?? "",
      street: defaultAddress?.street ?? "",
      city: defaultAddress?.city ?? "",
      state: defaultAddress?.state ?? "",
    };
  });
  const [submitting, setSubmitting] = React.useState(false);
  const prefilled = React.useRef(false);

  // Prefill name + email from the signed-in user once.
  React.useEffect(() => {
    if (prefilled.current || !session?.user) return;
    prefilled.current = true;
    const [firstName, ...rest] = (session.user.name ?? "").split(" ");
    setV((s) => ({
      ...s,
      firstName: s.firstName || firstName || "",
      lastName: s.lastName || rest.join(" "),
      email: s.email || session.user.email || "",
    }));
  }, [session]);

  const set = (k: keyof Values, val: string) => setV((s) => ({ ...s, [k]: val }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!lines.length) {
      toast.error("Your bag is empty.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            firstName: v.firstName,
            lastName: v.lastName,
            email: v.email,
            phone: v.phone,
          },
          address: { street: v.street, city: v.city, state: v.state },
          items: lines.map((l) => ({ slug: l.productSlug, variant: l.variant, qty: l.qty })),
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        authorizationUrl?: string;
        error?: string;
      };
      if (res.ok && json.authorizationUrl) {
        window.location.href = json.authorizationUrl;
        return;
      }
      toast.error(json.error ?? "Could not start checkout. Please try again.");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_20rem]">
      <form className="space-y-4" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="firstName" label="First name" value={v.firstName} onChange={(x) => set("firstName", x)} required />
          <Field id="lastName" label="Last name" value={v.lastName} onChange={(x) => set("lastName", x)} required />
        </div>
        <Field id="email" label="Email" type="email" value={v.email} onChange={(x) => set("email", x)} required />
        <Field id="phone" label="Phone" type="tel" value={v.phone} onChange={(x) => set("phone", x)} required />
        <Field id="street" label="Street address" value={v.street} onChange={(x) => set("street", x)} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="city" label="City" value={v.city} onChange={(x) => set("city", x)} required />
          <Field id="state" label="State" value={v.state} onChange={(x) => set("state", x)} required />
        </div>

        {testMode && (
          <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm text-foreground/80">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <strong>Test mode</strong> — no real charge. Use card <code>4084 0840 8408 4081</code>,
              any future expiry, CVV <code>408</code>, PIN <code>0000</code>, OTP <code>123456</code>.
            </span>
          </div>
        )}

        {!paystackReady && (
          <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>
              Online card payments are being switched on. To order now, message us on{" "}
              <a
                href="https://wa.me/2349013804907"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline"
              >
                WhatsApp
              </a>{" "}
              with your bag and delivery details.
            </span>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="btn-fill w-full"
          disabled={!paystackReady || submitting || lines.length === 0}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Redirecting to Paystack…
            </>
          ) : !paystackReady ? (
            "Pay with Paystack — coming soon"
          ) : lines.length ? (
            `Pay ${formatNaira(total)} with Paystack`
          ) : (
            "Pay with Paystack"
          )}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" /> Secured by Paystack · you&rsquo;ll be redirected to pay
        </p>
      </form>

      <aside className="h-max rounded-2xl border border-border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold">Order summary</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {lines.map((l) => (
            <li key={`${l.productSlug}-${l.variant ?? ""}`} className="flex justify-between gap-2">
              <span className="truncate text-muted-foreground">
                {l.qty}× {l.name}
              </span>
              <span>{formatNaira(l.priceKobo * l.qty)}</span>
            </li>
          ))}
          {lines.length === 0 && (
            <li className="text-muted-foreground">
              Your bag is empty.{" "}
              <Link href="/shop" className="underline">
                Shop now
              </Link>
              .
            </li>
          )}
        </ul>
        <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
          <Row label="Subtotal" value={formatNaira(subtotal)} />
          <Row label="Shipping" value={lines.length ? formatNaira(shipping) : "—"} />
          <Row label="Total" value={formatNaira(total)} strong />
        </div>
      </aside>
    </section>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={`flex justify-between ${
        strong ? "font-heading text-base font-semibold" : "text-muted-foreground"
      }`}
    >
      <span>{label}</span>
      <span className={strong ? "text-foreground" : ""}>{value}</span>
    </div>
  );
}
