"use client";

import * as React from "react";
import Image from "next/image";
import { ZoomIn } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { BLUR_DATA_URL } from "@/lib/image-loader";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = React.useState(0);

  return (
    <div className="flex gap-3">
      {/* thumbnails */}
      <div className="flex shrink-0 flex-col gap-3">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            className={cn(
              "relative size-16 overflow-hidden rounded-xl bg-muted transition",
              i === active ? "ring-2 ring-foreground" : "opacity-60 ring-1 ring-border hover:opacity-100",
            )}
          >
            <Image src={src} alt="" fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* main image */}
      <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl bg-secondary/50">
        <Image
          key={images[active]}
          src={images[active]}
          alt={alt}
          fill
          priority
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover"
        />
        <span className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-background/85 text-foreground/70 backdrop-blur">
          <ZoomIn className="size-4" />
        </span>
      </div>
    </div>
  );
}
