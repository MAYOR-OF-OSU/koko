"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import type { NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * A vertical nav list where each row reveals a scrolling marquee band (label +
 * repeating thumbnail) sliding in from whichever edge the cursor entered —
 * ported from react-bits' FlowingMenu, restyled onto this app's brand tokens
 * (cocoa/rose) instead of the original's color props, and built from Tailwind
 * classes rather than a component-scoped stylesheet (this codebase has none).
 */
export function FlowingMenu({ items, speed = 15 }: { items: NavItem[]; speed?: number }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {items.map((item, i) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <MenuRow key={item.href} item={item} index={i} speed={speed} active={active} />
        );
      })}
    </div>
  );
}

function findClosestEdge(mouseX: number, mouseY: number, width: number, height: number) {
  const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
  const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
  return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
}

function distMetric(x: number, y: number, x2: number, y2: number) {
  const xDiff = x - x2;
  const yDiff = y - y2;
  return xDiff * xDiff + yDiff * yDiff;
}

function MenuRow({
  item,
  index,
  speed,
  active,
}: {
  item: NavItem;
  index: number;
  speed: number;
  active: boolean;
}) {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const marqueeRef = React.useRef<HTMLDivElement>(null);
  const marqueeInnerRef = React.useRef<HTMLDivElement>(null);
  const animationRef = React.useRef<gsap.core.Tween | null>(null);
  const [repetitions, setRepetitions] = React.useState(4);

  // How many copies of the label+image are needed to fill the viewport width
  // (plus a couple extra) so the scroll loop never shows a gap.
  React.useEffect(() => {
    const calculateRepetitions = () => {
      const part = marqueeInnerRef.current?.querySelector<HTMLElement>(".marquee-part");
      if (!part) return;
      const contentWidth = part.offsetWidth;
      if (!contentWidth) return;
      const needed = Math.ceil(window.innerWidth / contentWidth) + 2;
      setRepetitions(prefersReducedMotion() ? 1 : Math.max(4, needed));
    };
    calculateRepetitions();
    window.addEventListener("resize", calculateRepetitions);
    return () => window.removeEventListener("resize", calculateRepetitions);
  }, [item.label, item.image]);

  React.useEffect(() => {
    if (prefersReducedMotion()) return;

    const setupMarquee = () => {
      const inner = marqueeInnerRef.current;
      const part = inner?.querySelector<HTMLElement>(".marquee-part");
      if (!inner || !part) return;
      const contentWidth = part.offsetWidth;
      if (!contentWidth) return;

      animationRef.current?.kill();
      animationRef.current = gsap.to(inner, {
        x: -contentWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    };

    const timer = setTimeout(setupMarquee, 50);
    return () => {
      clearTimeout(timer);
      animationRef.current?.kill();
    };
  }, [item.label, item.image, repetitions, speed]);

  const animationDefaults = prefersReducedMotion()
    ? { duration: 0.01 }
    : { duration: 0.6, ease: "expo" };

  function handleMouseEnter(ev: React.MouseEvent<HTMLAnchorElement>) {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
  }

  function handleMouseLeave(ev: React.MouseEvent<HTMLAnchorElement>) {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
  }

  return (
    <div
      ref={itemRef}
      className={cn(
        "relative flex-1 overflow-hidden",
        index > 0 && "border-t border-cocoa-foreground/15",
      )}
    >
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ animationDelay: `${60 * index + 80}ms` }}
        className={cn(
          "relative flex h-full items-center justify-center px-6 text-center font-heading text-[clamp(1.35rem,4svh,2.25rem)] leading-none text-cocoa-foreground/85 transition-colors hover:text-cocoa-foreground",
          "animate-in fade-in slide-in-from-right-4 fill-mode-both motion-reduce:animate-none",
          active && "text-rose underline decoration-1 underline-offset-8",
        )}
      >
        {item.label}
      </Link>

      <div
        ref={marqueeRef}
        className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden bg-rose"
        style={{ transform: "translateY(101%)" }}
      >
        <div className="h-full w-full overflow-hidden">
          <div ref={marqueeInnerRef} aria-hidden="true" className="flex h-full w-fit items-center will-change-transform">
            {[...Array(repetitions)].map((_, idx) => (
              <div key={idx} className="marquee-part flex shrink-0 items-center gap-6 px-6">
                <span className="whitespace-nowrap font-heading text-[clamp(1.35rem,4svh,2.25rem)] leading-none text-cocoa">
                  {item.label}
                </span>
                {item.image && (
                  <div className="relative h-[7svh] w-40 shrink-0 overflow-hidden rounded-full sm:w-48">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="12rem"
                      quality={45}
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
