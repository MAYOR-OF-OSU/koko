"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Heart, ShoppingBag, User } from "@/components/ui/icon";
import { useCart, selectCount } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

const cell =
  "flex flex-col items-center justify-center gap-0.5 py-2 text-[0.6rem] font-medium transition-colors";

/** Fixed bottom nav on mobile: Shop / Wishlist / Cart / Account. Hidden from lg up. */
export function MobileTabBar() {
  const pathname = usePathname();
  const setOpen = useCart((s) => s.setOpen);
  const count = useCart(selectCount);
  const hydrated = useHydrated();
  const showCount = hydrated && count > 0;

  const tone = (on: boolean) => (on ? "text-foreground" : "text-muted-foreground hover:text-foreground");

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background/95 backdrop-blur lg:hidden"
    >
      <Link href="/shop" className={cn(cell, tone(pathname.startsWith("/shop")))}>
        <Store className="size-5" />
        Shop
      </Link>

      <Link href="/account/wishlist" className={cn(cell, tone(pathname === "/account/wishlist"))}>
        <Heart className="size-5" />
        Wishlist
      </Link>

      <button type="button" onClick={() => setOpen(true)} className={cn(cell, tone(false))}>
        <span className="relative">
          <ShoppingBag className="size-5" />
          {showCount && (
            <span className="absolute -top-1 -right-2 grid min-w-4 place-items-center rounded-full bg-rose-deep px-1 text-[0.55rem] font-semibold text-white">
              {count}
            </span>
          )}
        </span>
        Cart
      </button>

      <Link
        href="/account"
        className={cn(
          cell,
          tone(pathname === "/account" || (pathname.startsWith("/account/") && pathname !== "/account/wishlist")),
        )}
      >
        <User className="size-5" />
        Account
      </Link>
    </nav>
  );
}
