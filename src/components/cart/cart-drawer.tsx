"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "@/components/ui/icon";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { useCart, selectSubtotal } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { lines, isOpen, setOpen, setQty, remove } = useCart();
  const subtotal = useCart(selectSubtotal);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl">Your bag</SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-muted-foreground">Your bag is empty.</p>
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className={buttonVariants({ variant: "outline" })}
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {lines.map((l) => (
              <div key={`${l.productSlug}-${l.variant ?? ""}`} className="flex gap-3">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image src={l.image} alt={l.name} fill sizes="80px" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">{l.name}</p>
                    <button
                      aria-label={`Remove ${l.name}`}
                      onClick={() => remove(l.productSlug, l.variant)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  {l.variant && <p className="text-xs text-muted-foreground">{l.variant}</p>}
                  <div className="mt-auto flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border">
                      <button
                        aria-label="Decrease quantity"
                        className="grid size-7 place-items-center"
                        onClick={() => setQty(l.productSlug, l.qty - 1, l.variant)}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm">{l.qty}</span>
                      <button
                        aria-label="Increase quantity"
                        className="grid size-7 place-items-center"
                        onClick={() => setQty(l.productSlug, l.qty + 1, l.variant)}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-medium">{formatNaira(l.priceKobo * l.qty)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {lines.length > 0 && (
          <SheetFooter className="gap-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-heading text-lg">{formatNaira(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping calculated at checkout.</p>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className={cn(buttonVariants({ size: "lg" }), "btn-fill w-full")}
            >
              Checkout
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
