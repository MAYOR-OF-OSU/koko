"use client";

import * as React from "react";
import { useCart } from "@/lib/cart-store";

/** Empties the (client-only) cart once, after a confirmed payment. */
export function ClearCartOnMount() {
  React.useEffect(() => {
    useCart.getState().clear();
  }, []);
  return null;
}
