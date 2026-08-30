"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { Logo } from "@/components/brand/logo";
import { CartButton } from "@/components/cart/cart-button";
import { primaryNav } from "@/lib/nav";
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

  // transparent white nav floating over the hero photo
  const overHero = isHome && !scrolled;

  return (
    <header
      className={cn(
        "z-50 w-full",
        isHome ? "fixed inset-x-0 top-0" : "sticky top-0",
      )}
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
          {/* left: mobile menu + nav (desktop) */}
          <div className="flex flex-1 items-center gap-6">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                aria-label="Open menu"
                className="grid size-9 place-items-center rounded-sm lg:hidden"
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>
                    <Logo variant="wordmark" className="h-5" />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-2 flex flex-col px-4">
                  {primaryNav.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="border-b border-border py-3.5 font-heading text-lg"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="py-3.5 font-heading text-lg"
                  >
                    Account
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            <nav className="hidden items-center gap-8 text-[0.82rem] tracking-wide lg:flex">
              {primaryNav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "transition-colors",
                    overHero ? "text-white/80 hover:text-white" : "text-foreground/75 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* center: wordmark */}
          <Link href="/" aria-label="Timi's Jewels home" className="shrink-0">
            <Logo variant="lockup" className={cn("transition-all", scrolled ? "h-6" : "h-7")} />
          </Link>

          {/* right: utilities */}
          <div className="flex flex-1 items-center justify-end gap-1">
            <Link
              href="/shop"
              aria-label="Search"
              className={cn(
                "hidden size-9 place-items-center rounded-sm transition sm:grid",
                overHero ? "text-white/80 hover:text-white" : "text-foreground/75 hover:text-foreground",
              )}
            >
              <Search className="size-[1.15rem]" />
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className={cn(
                "hidden size-9 place-items-center rounded-sm transition sm:grid",
                overHero ? "text-white/80 hover:text-white" : "text-foreground/75 hover:text-foreground",
              )}
            >
              <User className="size-[1.15rem]" />
            </Link>
            <CartButton
              className={overHero ? "text-white hover:text-white/80" : undefined}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
