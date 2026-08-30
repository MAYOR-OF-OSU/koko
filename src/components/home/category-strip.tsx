import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/mock-data";

export function CategoryStrip() {
  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto flex max-w-[100rem] items-end justify-between gap-4 px-4 sm:px-8">
        <div>
          <span className="eyebrow">Collections</span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl">Shop by category</h2>
        </div>
        <Link
          href="/shop"
          className="hidden text-[0.75rem] uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground sm:block"
        >
          View all
        </Link>
      </div>

      <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-8 md:mt-10">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/shop?category=${c.slug}`}
            className="group w-[16rem] shrink-0 snap-start sm:w-[19rem]"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="(max-width: 640px) 64vw, 19rem"
                className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
              />
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h3 className="font-heading text-lg">{c.name}</h3>
              <span className="text-xs text-muted-foreground">{c.blurb}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
