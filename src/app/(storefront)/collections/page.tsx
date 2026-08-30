import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { categories } from "@/lib/mock-data";
import { InteractiveHoverLink } from "@/components/ui/interactive-hover-button";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse Timi's Jewels by category and by curated edit.",
};

const EDITS = [
  {
    label: "New In",
    blurb: "The latest arrivals, fresh off the workbench.",
    href: "/shop?sort=new",
    image: "/categories/necklaces.jpg",
  },
  {
    label: "Bestsellers",
    blurb: "The pieces everyone keeps coming back for.",
    href: "/shop?sort=best",
    image: "/categories/rings.jpg",
  },
  {
    label: "On Sale",
    blurb: "Marked-down favourites while stock lasts.",
    href: "/shop?sort=sale",
    image: "/categories/earrings.jpg",
  },
];

export default function CollectionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Collections"
        title="Find your collection"
        subtitle="Every category and every curated edit in one place. Pick a lane, then refine in the shop."
      />

      {/* categories */}
      <section className="mx-auto max-w-[100rem] px-4 pb-16 sm:px-8">
        <h2 className="mb-8 font-heading text-2xl sm:text-3xl">Shop by category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted"
            >
              <Image
                src={c.image}
                alt={c.name}
                fill
                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 22vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="font-heading text-lg leading-tight">{c.name}</p>
                <p className="text-[0.72rem] text-white/75">{c.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* curated edits */}
      <section className="mx-auto max-w-[100rem] px-4 pb-16 sm:px-8">
        <h2 className="mb-8 font-heading text-2xl sm:text-3xl">Curated edits</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {EDITS.map((e) => (
            <div key={e.label} className="overflow-hidden rounded-2xl ring-1 ring-border">
              <div className="relative aspect-[16/10] bg-muted">
                <Image src={e.image} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="space-y-3 p-5">
                <h3 className="font-heading text-xl">{e.label}</h3>
                <p className="text-sm text-muted-foreground">{e.blurb}</p>
                <InteractiveHoverLink href={e.href} variant="outline">
                  Shop {e.label}
                </InteractiveHoverLink>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
