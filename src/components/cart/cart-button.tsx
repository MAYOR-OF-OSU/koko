"use client";

import { ShoppingBag } from "lucide-react";
import { useCart, selectCount } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const setOpen = useCart((s) => s.setOpen);
  const count = useCart(selectCount);
  const hydrated = useHydrated();
  const showCount = hydrated && count > 0;

  return (
    <button
      type="button"
      aria-label={`Open cart${showCount ? `, ${count} item${count > 1 ? "s" : ""}` : ""}`}
      onClick={() => setOpen(true)}
      className={cn(
        "relative grid size-9 place-items-center rounded-sm text-foreground/75 transition hover:text-foreground",
        className,
      )}
    >
      <ShoppingBag className="size-[1.15rem]" />
      {showCount && (
        <span className="absolute right-0 top-0 grid min-w-4 place-items-center rounded-full bg-rose-deep px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
