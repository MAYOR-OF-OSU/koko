"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

export type CartLine = {
  productSlug: string;
  name: string;
  image: string;
  priceKobo: number;
  variant?: string;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  /** Session-only: the drawer auto-opens on the first add, then stays out of the
   *  way so repeated adds don't interrupt browsing. Cleared on checkout. */
  autoOpenedOnce: boolean;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (productSlug: string, variant?: string) => void;
  setQty: (productSlug: string, qty: number, variant?: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

const key = (slug: string, variant?: string) => `${slug}::${variant ?? ""}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      autoOpenedOnce: false,
      add: (line, qty = 1) => {
        let notify = false;
        set((state) => {
          const idx = state.lines.findIndex(
            (l) => key(l.productSlug, l.variant) === key(line.productSlug, line.variant),
          );
          const lines =
            idx >= 0
              ? state.lines.map((l, i) => (i === idx ? { ...l, qty: l.qty + qty } : l))
              : [...state.lines, { ...line, qty }];
          // Open the drawer only on the first add of the session (or if it's
          // already open); after that just refresh it quietly.
          const open = state.isOpen || !state.autoOpenedOnce;
          notify = !open;
          return { lines, isOpen: open, autoOpenedOnce: true };
        });
        if (notify) toast.success("Added to your bag");
      },
      remove: (slug, variant) =>
        set((state) => ({
          lines: state.lines.filter((l) => key(l.productSlug, l.variant) !== key(slug, variant)),
        })),
      setQty: (slug, qty, variant) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              key(l.productSlug, l.variant) === key(slug, variant)
                ? { ...l, qty: Math.max(1, qty) }
                : l,
            )
            .filter((l) => l.qty > 0),
        })),
      clear: () => set({ lines: [], isOpen: false, autoOpenedOnce: false }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: "timis-jewels-cart",
      // Only the bag contents survive a reload — never the open/auto-open state
      // (guard both the write and the read, incl. older stored blobs).
      partialize: (s) => ({ lines: s.lines }),
      merge: (persisted, current) => ({
        ...current,
        lines: (persisted as { lines?: CartLine[] } | undefined)?.lines ?? current.lines,
      }),
    },
  ),
);

export const selectCount = (s: CartState) => s.lines.reduce((n, l) => n + l.qty, 0);
export const selectSubtotal = (s: CartState) =>
  s.lines.reduce((n, l) => n + l.priceKobo * l.qty, 0);
