import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopSidebar } from "@/components/shop/shop-sidebar";
import { ShopSearch } from "@/components/shop/shop-search";
import { ShopPagination } from "@/components/shop/shop-pagination";
import { ProductCard } from "@/components/shop/product-card";
import { FeaturedRail } from "@/components/home/featured-rail";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { NewsletterForm } from "@/components/home/newsletter";
import { products, getCategory } from "@/lib/mock-data";

// Dark, jewellery-forward frames the "Shop" wordmark stays legible over.
const SHOP_BANNER = [
  "/shop/shop-banner.jpg",
  "/shop/lifestyle-dark.jpg",
  "/hero/hero-editorial.jpg",
  "/hero/hero-alt.jpg",
];

export const metadata: Metadata = {
  title: "Shop",
  description: "Neck chains, earrings, rings, bracelets, anklets and more — all handpicked.",
};

const PER_PAGE = 9;

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const page = Math.max(1, Number(sp.page) || 1);

  let list = products.filter((p) => (category ? p.categorySlug === category : true));
  if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
  if (sort === "new") list = list.filter((p) => p.badge === "new").concat(list.filter((p) => p.badge !== "new"));
  else if (sort === "best") list = list.filter((p) => p.badge === "bestseller");
  else if (sort === "sale") list = list.filter((p) => p.badge === "sale");

  const cat = category ? getCategory(category) : undefined;
  const pageCount = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const pageItems = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const makeHref = (p: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  const recommendations = products.filter((p) => !pageItems.includes(p)).slice(0, 10);

  return (
    <>
      {/* banner */}
      <section className="px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="relative isolate overflow-hidden rounded-3xl bg-cocoa">
          <HeroCarousel images={SHOP_BANNER} />
          {/* legibility scrim — flat dim + a centre vignette, under the text */}
          <div className="absolute inset-0 -z-10 bg-black/45" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55),transparent_72%)]" />
          <div className="flex min-h-[26vh] items-center justify-center py-10">
            <h1 className="font-heading text-[22vw] leading-none text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] sm:text-[12rem]">
              Shop
            </h1>
          </div>
        </div>
        <Suspense fallback={<div className="h-14" />}>
          <ShopSearch />
        </Suspense>
      </section>

      <section className="mx-auto mt-6 max-w-[100rem] px-4 pb-16 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
          <Suspense fallback={<div className="hidden lg:block" />}>
            <ShopSidebar />
          </Suspense>

          <div>
            <p className="mb-6 text-sm text-muted-foreground">
              {cat ? cat.name : "All pieces"} · {list.length} item{list.length === 1 ? "" : "s"}
            </p>
            {pageItems.length === 0 ? (
              <p className="py-20 text-center text-muted-foreground">Nothing matches those filters.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
                {pageItems.map((p, i) => (
                  <ProductCard key={p.slug} product={p} priority={i < 3} />
                ))}
              </div>
            )}
            <ShopPagination page={page} pageCount={pageCount} makeHref={makeHref} />
          </div>
        </div>

        {/* recommendations */}
        <div className="mt-14">
          <div className="mb-2 flex items-end justify-between">
            <h2 className="font-heading text-2xl sm:text-3xl">Explore our recommendations</h2>
          </div>
          <FeaturedRail>
            {recommendations.map((p) => (
              <ProductCard key={p.slug} product={p} className="w-[17rem] shrink-0 snap-start" />
            ))}
          </FeaturedRail>
        </div>
      </section>

      {/* newsletter band */}
      <section className="bg-cocoa text-cocoa-foreground">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-10 text-center sm:px-6">
          <h2 className="font-heading text-3xl sm:text-4xl">Ready to get our new pieces?</h2>
          <p className="text-sm text-cocoa-foreground/75">
            Join the list for new drops, restocks and members-only sales.
          </p>
          <div className="w-full max-w-sm">
            <NewsletterForm variant="footer" />
          </div>
        </div>
      </section>
    </>
  );
}
