"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      add: (line, qty = 1) =>
        set((state) => {
          const idx = state.lines.findIndex(
            (l) => key(l.productSlug, l.variant) === key(line.productSlug, line.variant),
          );
          if (idx >= 0) {
            const lines = [...state.lines];
            lines[idx] = { ...lines[idx], qty: lines[idx].qty + qty };
            return { lines, isOpen: true };
          }
          return { lines: [...state.lines, { ...line, qty }], isOpen: true };
        }),
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
      clear: () => set({ lines: [] }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    { name: "timis-jewels-cart" },
  ),
);

export const selectCount = (s: CartState) => s.lines.reduce((n, l) => n + l.qty, 0);
export const selectSubtotal = (s: CartState) =>
  s.lines.reduce((n, l) => n + l.priceKobo * l.qty, 0);
