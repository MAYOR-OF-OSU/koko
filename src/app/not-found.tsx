import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { InteractiveHoverLink } from "@/components/ui/interactive-hover-button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

const links = [
  { label: "Shop", href: "/shop" },
  { label: "Journal", href: "/journal" },
  { label: "Track order", href: "/track-order" },
  { label: "Contact", href: "/contact" },
];

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <Link href="/" aria-label="Timi's Jewels home">
        <Logo variant="monogram" className="h-12" />
      </Link>
      <div>
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">
          The piece you&rsquo;re looking for may have sold out or moved. Let&rsquo;s get you back
          on track.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <InteractiveHoverLink href="/shop" variant="solid" className="min-w-[9rem] justify-center">
          Back to shop
        </InteractiveHoverLink>
        <InteractiveHoverLink href="/" variant="outline" className="min-w-[9rem] justify-center">
          Home
        </InteractiveHoverLink>
      </div>

      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="transition-colors hover:text-foreground">
            {l.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
