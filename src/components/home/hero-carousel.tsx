"use client";

import * as React from "react";
import Image from "next/image";
import { BLUR_DATA_URL } from "@/lib/image-loader";
import { cn } from "@/lib/utils";

/** Crossfades through the hero images every 3s. Static under reduced-motion. */
export function HeroCarousel({ images }: { images: string[] }) {
  const list = images.length ? images : ["/hero/hero-main.jpg"];
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    if (list.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % list.length), 3000);
    return () => clearInterval(id);
  }, [list.length]);

  return (
    <>
      {list.map((src, idx) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={idx === 0}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="100vw"
          className={cn(
            "-z-10 object-cover transition-opacity duration-1000",
            idx === i && "animate-kenburns",
          )}
          style={{ opacity: idx === i ? 1 : 0 }}
        />
      ))}
    </>
  );
}
