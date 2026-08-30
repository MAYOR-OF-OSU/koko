"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, User } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CartButton } from "@/components/cart/cart-button";
import { MenuPanel } from "@/components/layout/menu-panel";
import { cn } from "@/lib/utils";

export function SiteHeader({ announcement }: { announcement?: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // transparent white bar floating over the hero photo
  const overHero = isHome && !scrolled;
  const iconTone = overHero
    ? "text-white/80 hover:text-white"
    : "text-foreground/75 hover:text-foreground";

  return (
    <>
      <header
        className={cn("z-50 w-full", isHome ? "fixed inset-x-0 top-0" : "sticky top-0")}
      >
        {announcement}
        <div
          className={cn(
            "border-b transition-colors duration-300",
            overHero
              ? "border-transparent bg-[linear-gradient(to_bottom,rgba(18,8,24,0.55),rgba(18,8,24,0.15)_70%,transparent)] text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]"
              : "border-border bg-background/95 text-foreground backdrop-blur",
          )}
        >
          <div
            className={cn(
              "mx-auto flex max-w-[100rem] items-center justify-between gap-6 px-4 transition-all duration-300 sm:px-8",
              scrolled ? "h-16" : "h-20",
            )}
          >
            {/* left: wordmark */}
            <Link href="/" aria-label="Timi's Jewels home" className="shrink-0">
              <Logo
                variant="lockup"
                className={cn("transition-all", scrolled ? "h-6" : "h-7")}
              />
            </Link>

            {/* right: utilities + menu */}
            <div className="flex items-center gap-1">
              <Link
                href="/shop"
                aria-label="Search"
                className={cn(
                  "hidden size-9 place-items-center rounded-sm transition-colors sm:grid",
                  iconTone,
                )}
              >
                <Search className="size-[1.15rem]" />
              </Link>
              <Link
                href="/account"
                aria-label="Account"
                className={cn(
                  "hidden size-9 place-items-center rounded-sm transition-colors sm:grid",
                  iconTone,
                )}
              >
                <User className="size-[1.15rem]" />
              </Link>
              <CartButton
                className={overHero ? "text-white hover:text-white/80" : undefined}
              />
              <button
                type="button"
                aria-label="Open menu"
                aria-haspopup="dialog"
                aria-expanded={open}
                onClick={() => setOpen(true)}
                className={cn(
                  "ml-1 flex items-center gap-2 rounded-sm p-1 transition-colors",
                  iconTone,
                )}
              >
                <span className="hidden text-[0.72rem] font-medium uppercase tracking-[0.18em] sm:inline">
                  Menu
                </span>
                <Menu className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MenuPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
