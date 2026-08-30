import { ProductCard } from "@/components/shop/product-card";
import { products } from "@/lib/mock-data";
import { InteractiveHoverLink } from "@/components/ui/interactive-hover-button";
import { FeaturedRail } from "@/components/home/featured-rail";

export function FeaturedProducts() {
  const list = products.slice(0, 10);

  return (
    <section className="mx-auto max-w-[100rem] px-4 py-24 sm:px-8">
      <div className="grid min-w-0 gap-10 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-center">
        <div>
          <span className="eyebrow">The edit</span>
          <h2 className="mt-3 font-heading text-4xl leading-[1.05] sm:text-5xl">
            Diamonds &amp;
            <br />
            engagement rings
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Experience the beauty of fine jewelry and find your perfect piece for any special
            occasion — from everyday sparkle to anniversary gifts.
          </p>
          <div className="mt-7">
            <InteractiveHoverLink href="/shop" variant="outline">
              More Product
            </InteractiveHoverLink>
          </div>
        </div>

        <FeaturedRail>
          {list.map((p) => (
            <ProductCard key={p.slug} product={p} className="w-[17rem] shrink-0 snap-start" />
          ))}
        </FeaturedRail>
      </div>
    </section>
  );
}
