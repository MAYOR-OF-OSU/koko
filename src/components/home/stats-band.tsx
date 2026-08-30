"use client";

import * as React from "react";
import type { StatsContent } from "@/lib/site-content-defaults";

/** Splits "2000+" → { prefix:"", number:2000, suffix:"+" }; non-numeric → number:null. */
function parseValue(raw: string) {
  const m = raw.match(/^(\D*)([\d,]+)(.*)$/);
  if (!m) return { prefix: "", number: null as number | null, suffix: raw };
  return { prefix: m[1], number: Number(m[2].replace(/,/g, "")), suffix: m[3] };
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function Counter({ value }: { value: string }) {
  const { prefix, number, suffix } = React.useMemo(() => parseValue(value), [value]);
  const ref = React.useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = React.useState<number | null>(number);

  React.useEffect(() => {
    if (number == null) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- start hidden-at-zero, animate on view
    setDisplay(0);
    let raf = 0;
    const DURATION = 1400;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / DURATION);
          setDisplay(Math.round(easeOut(p) * number));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [number]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display == null ? "" : display.toLocaleString("en-NG")}
      {suffix}
    </span>
  );
}

export function StatsBand({ content }: { content: StatsContent }) {
  if (!content.enabled || content.items.length === 0) return null;

  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-[100rem] px-4 py-14 sm:px-8">
        {content.eyebrow && (
          <p className="mb-8 text-center text-[0.7rem] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            {content.eyebrow}
          </p>
        )}
        <dl className="grid grid-cols-2 gap-y-8 text-center lg:grid-cols-4">
          {content.items.map((s, i) => (
            <div key={i} className="px-2">
              <dt className="font-heading text-4xl leading-none text-foreground sm:text-5xl">
                <Counter value={s.value} />
              </dt>
              <dd className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
