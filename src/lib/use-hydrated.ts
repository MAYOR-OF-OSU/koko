"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * `false` during SSR and the first client render, `true` after hydration.
 * Effect-free replacement for the `useState(false)` + `useEffect(setTrue)` idiom.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
