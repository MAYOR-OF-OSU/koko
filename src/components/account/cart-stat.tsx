"use client";

import { useCart, selectCount } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";

/** Live cart-item count for the account overview stat card. */
export function CartStat() {
  const count = useCart(selectCount);
  const hydrated = useHydrated();
  return <>{hydrated ? count : 0}</>;
}
