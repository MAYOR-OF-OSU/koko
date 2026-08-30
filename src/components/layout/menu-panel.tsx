"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "@/components/ui/icon";
import { Sheet, SheetContent, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/brand/logo";
import { FlowingMenu } from "@/components/layout/flowing-menu";
import { primaryNav, contact } from "@/lib/nav";

/**
 * The site's primary navigation: a dark editorial panel that slides in from the
 * right. Replaces both the old desktop nav row and the mobile drawer — it is the
 * only nav at every breakpoint. Controlled by the header via `open`/`onOpenChange`.
 */
export function MenuPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const pathname = usePathname();

  // Close whenever the route changes — covers every link, incl. the contact row.
  React.useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col gap-0 bg-cocoa p-0 text-cocoa-foreground data-[side=right]:w-full data-[side=right]:sm:w-[26rem] data-[side=right]:sm:max-w-none"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>

        <div className="flex items-center justify-between px-6 pt-6">
          <Link href="/" aria-label="Timi's Jewels home">
            <Logo variant="wordmark" className="h-5 text-cocoa-foreground" />
          </Link>
          <SheetClose
            aria-label="Close menu"
            className="-mr-2 rounded-full p-2 text-cocoa-foreground/70 transition-colors hover:text-cocoa-foreground"
          >
            <X className="size-5" />
          </SheetClose>
        </div>

        <div className="mt-6 flex-1 overflow-hidden">
          <FlowingMenu items={primaryNav} />
        </div>

        <div className="border-t border-cocoa-foreground/15 px-6 py-6 text-cocoa-foreground/70">
          <div className="flex gap-6 text-sm">
            <Link href="/account" className="transition-colors hover:text-cocoa-foreground">
              Account
            </Link>
            <Link href="/journal" className="transition-colors hover:text-cocoa-foreground">
              Journal
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem]">
            <a
              href={`tel:${contact.phones[0].replace(/^0/, "+234")}`}
              className="transition-colors hover:text-cocoa-foreground"
            >
              {contact.phones[0]}
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="transition-colors hover:text-cocoa-foreground"
            >
              Email
            </a>
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-cocoa-foreground"
            >
              WhatsApp
            </a>
            <a
              href={contact.instagram}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-cocoa-foreground"
            >
              {"@" + contact.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/+$/, "")}
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
