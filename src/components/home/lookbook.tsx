import Image from "next/image";
import Link from "next/link";
import { products, imagePool } from "@/lib/mock-data";

// Necklaces first, then a spread across the rest of the catalogue.
const shots = [
  ...imagePool["neck-chains"].map((src, i) => ({ src, label: "Neck chains", href: "/shop?category=neck-chains", key: `n${i}` })),
  ...products
    .filter((p) => p.categorySlug !== "neck-chains")
    .slice(0, 7)
    .map((p) => ({ src: p.image, label: p.name, href: `/shop/${p.slug}`, key: p.slug })),
];

export function Lookbook() {
  return (
    <section className="border-y border-border bg-secondary/40 py-20">
      <div className="mx-auto flex max-w-[100rem] items-end justify-between gap-4 px-4 sm:px-8">
        <div>
          <span className="eyebrow">Lookbook</span>
          <h2 className="mt-3 font-heading text-3xl sm:text-4xl">Seen on you</h2>
        </div>
        <Link
          href="/shop"
          className="hidden text-[0.75rem] uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground sm:block"
        >
          Shop the look
        </Link>
      </div>

      <div className="no-scrollbar mt-10 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:px-8">
        {shots.map((s, i) => (
          <Link
            key={s.key}
            href={s.href}
            className="group relative aspect-[3/4] w-[14rem] shrink-0 snap-start overflow-hidden bg-muted sm:w-[17rem]"
          >
            <Image
              src={s.src}
              alt={s.label}
              fill
              sizes="(max-width: 640px) 56vw, 17rem"
              className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
              priority={i < 2}
            />
            <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 text-[0.7rem] uppercase tracking-[0.14em] text-white opacity-0 transition group-hover:opacity-100">
              {s.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
