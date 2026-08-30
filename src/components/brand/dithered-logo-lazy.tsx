"use client";

import * as React from "react";
import { DitheredLogo, type DitheredLogoProps } from "@/components/brand/dithered-logo";
import { cn } from "@/lib/utils";

/**
 * Mounts the (canvas-heavy) DitheredLogo only once it scrolls near the viewport,
 * and unmounts it when far away so its rAF/observers stop. Falls back to a plain
 * <img> of the same source until then.
 */
export function DitheredLogoLazy({ className, ...props }: DitheredLogoProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setShow(entry.isIntersecting),
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("relative h-60 w-60", className)}>
      {show ? (
        <DitheredLogo {...props} className="absolute inset-0 h-full w-full" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={props.imageSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-contain opacity-70"
        />
      )}
    </div>
  );
}
