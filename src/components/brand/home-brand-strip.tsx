"use client";

import { usePathname } from "next/navigation";
import { DitheredLogoLazy } from "@/components/brand/dithered-logo-lazy";

/** A DitheredLogo brand moment shown only on the homepage, just above the footer. */
export function HomeBrandStrip() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <section className="flex flex-col items-center gap-3 border-t border-border bg-secondary/40 py-16">
      <DitheredLogoLazy
        imageSrc="/brand/logo-dither.svg"
        particleColor="var(--primary)"
        className="h-40 w-40 sm:h-52 sm:w-52"
      />
      <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">
        Timi&rsquo;s Jewels
      </p>
    </section>
  );
}
