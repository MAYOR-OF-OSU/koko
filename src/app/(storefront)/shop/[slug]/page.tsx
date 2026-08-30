import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { ProductGallery } from "@/components/shop/product-gallery";
import { AddToCart } from "@/components/shop/add-to-cart";
import { ProductTabs } from "@/components/shop/product-tabs";
import { ProductCard } from "@/components/shop/product-card";
import { getProduct, getCategory, products } from "@/lib/mock-data";
import { formatNaira } from "@/lib/format";
import { env } from "@/lib/env";

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: "Not found" };
  const abs = `${env.NEXT_PUBLIC_SITE_URL}${p.image}`;
  return {
    title: p.name,
    description: p.description,
    alternates: { canonical: `/shop/${slug}` },
    openGraph: { type: "website", images: [abs], title: p.name, description: p.description },
    twitter: { card: "summary_large_image", images: [abs], title: p.name, description: p.description },
  };
}

function reviewCount(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return 12 + (h % 240);
}

export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.categorySlug);
  const related = products
    .filter((p) => p.categorySlug === product.categorySlug && p.slug !== product.slug)
    .slice(0, 4);
  const off = product.compareAtKobo
    ? Math.round((1 - product.priceKobo / product.compareAtKobo) * 100)
    : 0;

  const base = env.NEXT_PUBLIC_SITE_URL;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        image: product.images.map((i) => `${base}${i}`),
        description: product.description,
        brand: { "@type": "Brand", name: "Timi's Jewels" },
        category: category?.name,
        itemCondition: "https://schema.org/NewCondition",
        offers: {
          "@type": "Offer",
          priceCurrency: "NGN",
          price: (product.priceKobo / 100).toFixed(2),
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          url: `${base}/shop/${product.slug}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Shop", item: `${base}/shop` },
          ...(category
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: category.name,
                  item: `${base}/shop?category=${category.slug}`,
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: category ? 3 : 2,
            name: product.name,
            item: `${base}/shop/${product.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-[100rem] px-4 pt-16 text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground sm:px-8 sm:pt-20">
        <Link href="/shop" className="hover:text-foreground">
          Shop
        </Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/shop?category=${category.slug}`} className="hover:text-foreground">
              {category.name}
            </Link>
          </>
        )}
      </div>

      <section className="mx-auto grid max-w-[100rem] gap-10 px-4 py-6 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="lg:py-4">
          {product.badge && (
            <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-primary">
              {product.badge === "sale" ? "Sale" : product.badge === "new" ? "New Arrival" : "Bestseller"}
            </span>
          )}
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex gap-0.5 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={i < Math.round(product.rating) ? "size-4 fill-current" : "size-4"} />
              ))}
            </span>
            <span className="text-muted-foreground">
              {product.rating.toFixed(1)} ({reviewCount(product.slug)} reviews)
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">{formatNaira(product.priceKobo)}</span>
            {product.compareAtKobo && (
              <>
                <span className="text-muted-foreground line-through">
                  {formatNaira(product.compareAtKobo)}
                </span>
                <span className="rounded-md bg-foreground px-2 py-0.5 text-[0.7rem] font-semibold text-background">
                  {off}% OFF
                </span>
              </>
            )}
          </div>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8">
            <AddToCart product={product} />
          </div>
        </div>
      </section>

      <ProductTabs description={product.description} />

      {related.length > 0 && (
        <section className="mx-auto max-w-[100rem] px-4 py-10 sm:px-8 md:py-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-heading text-2xl sm:text-3xl">You may also like</h2>
            <Link
              href={category ? `/shop?category=${category.slug}` : "/shop"}
              className="text-[0.75rem] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
