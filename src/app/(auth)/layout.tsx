import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { DitheredLogoLazy } from "@/components/brand/dithered-logo-lazy";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-secondary px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-30px_rgba(42,23,32,0.35)] lg:grid-cols-[1.05fr_1fr]">
        {/* left — editorial aside (desktop only) */}
        <aside className="relative hidden min-h-[40rem] flex-col justify-between overflow-hidden bg-cocoa p-10 text-cocoa-foreground lg:flex">
          <Image
            src="/hero/hero-poster.jpg"
            alt=""
            fill
            priority
            sizes="55vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--cocoa)_88%,transparent)_0%,color-mix(in_oklch,var(--cocoa)_55%,transparent)_45%,color-mix(in_oklch,var(--cocoa)_92%,transparent)_100%)]" />

          <div className="relative z-10 flex items-center justify-between">
            <Link href="/" aria-label="Timi's Jewels home">
              <Logo variant="lockup" className="h-8 text-cocoa-foreground" />
            </Link>
          </div>

          <div className="relative z-10 flex justify-center">
            <DitheredLogoLazy
              imageSrc="/brand/logo-dither.svg"
              particleColor="#ffffff"
              className="h-40 w-40"
            />
          </div>

          <div className="relative z-10 max-w-sm">
            <div className="mb-5 h-px w-12 bg-accent-gold" />
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-accent-gold">
              Elevating beauty to its finest
            </p>
            <h2 className="mt-4 font-heading text-4xl uppercase leading-[1.05] lg:text-5xl">
              Crafted to captivate
            </h2>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cocoa-foreground/75">
              Sign in to track orders, save your favourite pieces and check out faster.
            </p>
          </div>
        </aside>

        {/* right — form panel */}
        <div className="flex flex-col justify-center p-7 sm:p-12">
          {/* compact brand for mobile (aside is hidden) */}
          <Link href="/" className="mb-8 self-center lg:hidden">
            <Logo variant="lockup" className="h-7" />
          </Link>
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
