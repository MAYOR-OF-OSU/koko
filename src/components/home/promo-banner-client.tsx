"use client";

import * as React from "react";
import { InteractiveHoverLink } from "@/components/ui/interactive-hover-button";

const pad = (n: number) => String(n).padStart(2, "0");
const ROLLING = 6 * 86400000 + 3600000 * 7;

function useCountdown(endsAtIso: string) {
  const [remaining, setRemaining] = React.useState<number | null>(null);

  React.useEffect(() => {
    const parsed = endsAtIso ? Date.parse(endsAtIso) : NaN;
    const target =
      Number.isFinite(parsed) && parsed > Date.now() ? parsed : Date.now() + ROLLING;
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAtIso]);

  const diff = remaining ?? ROLLING;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

export function PromoBannerClient({
  eyebrow,
  headline,
  ctaLabel,
  ctaHref,
  endsAtIso,
}: {
  eyebrow: string;
  headline: string;
  ctaLabel: string;
  ctaHref: string;
  endsAtIso: string;
}) {
  const { d, h, m, s } = useCountdown(endsAtIso);

  return (
    <section className="bg-cocoa text-cocoa-foreground">
      <div className="mx-auto flex max-w-[100rem] flex-col items-center gap-6 px-4 py-16 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-left">
        <div>
          <span className="text-[0.7rem] uppercase tracking-[0.24em] text-accent-gold">{eyebrow}</span>
          <h2 className="mt-3 max-w-xl font-heading text-2xl sm:text-3xl">{headline}</h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-4 text-center font-heading text-2xl">
            {[
              ["D", d],
              ["H", h],
              ["M", m],
              ["S", s],
            ].map(([label, v]) => (
              <div key={label as string}>
                <div>{pad(v as number)}</div>
                <div className="mt-1 text-[0.6rem] font-sans uppercase tracking-widest text-cocoa-foreground/50">
                  {label}
                </div>
              </div>
            ))}
          </div>
          <InteractiveHoverLink href={ctaHref} variant="onDark" className="whitespace-nowrap">
            {ctaLabel}
          </InteractiveHoverLink>
        </div>
      </div>
    </section>
  );
}
