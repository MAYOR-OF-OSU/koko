"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "@/components/ui/icon";
import { PageHero } from "@/components/layout/page-hero";
import { InteractiveHoverLink } from "@/components/ui/interactive-hover-button";
import { useCart, selectSubtotal } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";

export default function CartPage() {
  const { lines, setQty, remove } = useCart();
  const subtotal = useCart(selectSubtotal);

  return (
    <>
      <PageHero eyebrow="Bag" title="Your bag" />
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        {lines.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Your bag is empty.</p>
            <InteractiveHoverLink href="/shop" variant="outline" className="mt-5">
              Start shopping
            </InteractiveHoverLink>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
            <ul className="divide-y divide-border">
              {lines.map((l) => (
                <li key={`${l.productSlug}-${l.variant ?? ""}`} className="flex gap-4 py-5">
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image src={l.image} alt={l.name} fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-medium">{l.name}</p>
                        {l.variant && <p className="text-sm text-muted-foreground">{l.variant}</p>}
                      </div>
                      <button
                        onClick={() => remove(l.productSlug, l.variant)}
                        aria-label={`Remove ${l.name}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border">
                        <button className="grid size-8 place-items-center" onClick={() => setQty(l.productSlug, l.qty - 1, l.variant)} aria-label="Decrease">
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm">{l.qty}</span>
                        <button className="grid size-8 place-items-center" onClick={() => setQty(l.productSlug, l.qty + 1, l.variant)} aria-label="Increase">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="font-medium">{formatNaira(l.priceKobo * l.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-max rounded-2xl border border-border bg-card p-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-heading text-lg">{formatNaira(subtotal)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Shipping calculated at checkout.</p>
              <InteractiveHoverLink href="/checkout" className="mt-4 w-full justify-center">
                Checkout
              </InteractiveHoverLink>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
