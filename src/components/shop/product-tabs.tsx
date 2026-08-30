"use client";

import * as React from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = ["Details", "Materials", "Size & Fit", "Shipping & Returns"] as const;

const FEATURES = [
  "Tarnish-resistant plating",
  "Hypoallergenic, nickel-free",
  "Secure lobster clasp",
  "Comes gift-boxed with a polishing cloth",
];

export function ProductTabs({ description }: { description: string }) {
  const [tab, setTab] = React.useState<(typeof TABS)[number]>("Details");

  return (
    <section className="mx-auto max-w-[100rem] px-4 py-10 sm:px-8">
      <div className="flex gap-6 border-b border-border text-sm">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 pb-3 transition-colors",
              tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="text-sm leading-relaxed text-muted-foreground">
          {tab === "Details" && (
            <>
              <p>{description}</p>
              <ul className="mt-5 space-y-2.5">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="size-4 shrink-0 text-primary" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {tab === "Materials" && (
            <p>
              Brass base with 18k gold-tone, rose-gold or rhodium plating and cubic-zirconia stones.
              Free of lead, cadmium and nickel. Posts and clasps are hypoallergenic surgical steel.
            </p>
          )}
          {tab === "Size & Fit" && (
            <p>
              Chains come in 16&quot;, 18&quot; and 20&quot; — 18&quot; is our most popular length and
              rests on the collarbone. Rings are true to size; if you&apos;re between sizes, size up.
              Message us on WhatsApp for a fitting.
            </p>
          )}
          {tab === "Shipping & Returns" && (
            <p>
              Dispatched within 24 hours. Nationwide delivery in 2–4 working days. Unworn items in
              original packaging can be returned within 7 days for store credit. Every piece carries a
              60-day sparkle guarantee.
            </p>
          )}
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cocoa">
          <Image src="/shop/lifestyle-dark.jpg" alt="" fill sizes="(max-width:1024px) 100vw, 45vw" className="object-cover opacity-90" />
        </div>
      </div>
    </section>
  );
}
