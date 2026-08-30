/**
 * Placeholder catalog for Phase 1 (no DB reads on the marketing pages yet).
 * Images are real jewelry photos (Unsplash) saved under public/products/,
 * one pool of 5 per category. Swap for Cloudflare-hosted assets later.
 * The 7 categories match the brand's flyer ("We sell: …").
 */

export type MockCategory = {
  slug: string;
  name: string;
  blurb: string;
  image: string;
};

export type MockProduct = {
  slug: string;
  name: string;
  categorySlug: string;
  priceKobo: number;
  compareAtKobo?: number;
  image: string;
  images: string[];
  badge?: "new" | "bestseller" | "sale";
  rating: number;
  description: string;
};

/** 5 photos per category slug -> /public/products/<slug>-<1..5>.jpg */
export const imagePool: Record<string, string[]> = Object.fromEntries(
  [
    "neck-chains",
    "fashion-earrings",
    "floral-party-earrings",
    "studs",
    "knuckle-rings",
    "bracelets-bangles",
    "leg-chains",
  ].map((slug) => [slug, [1, 2, 3, 4, 5].map((n) => `/products/${slug}-${n}.jpg`)]),
);

export const HERO_POSTER = "/hero/hero-poster.jpg";

const poolFor = (slug: string) => imagePool[slug] ?? imagePool["neck-chains"];

export const categories: MockCategory[] = [
  { slug: "neck-chains", name: "Neck Chains", blurb: "Delicate to statement" },
  { slug: "fashion-earrings", name: "Fashion Earrings", blurb: "Everyday sparkle" },
  { slug: "floral-party-earrings", name: "Floral & Party Earrings", blurb: "For the occasion" },
  { slug: "studs", name: "Studs", blurb: "Quiet essentials" },
  { slug: "knuckle-rings", name: "Knuckle Rings", blurb: "Stacked & bold" },
  { slug: "bracelets-bangles", name: "Bracelets & Bangles", blurb: "Wrist candy" },
  { slug: "leg-chains", name: "Leg Chains", blurb: "Anklets that move" },
].map((c) => ({ ...c, image: poolFor(c.slug)[0] }));

const names = [
  "Aurelia", "Seraphine", "Isoke", "Lumen", "Adaeze", "Noor", "Zahra", "Ondine",
  "Mira", "Solene", "Amara", "Celestine", "Ife", "Odalys", "Vesper", "Renata",
  "Bijou", "Thalia", "Najma", "Elowen", "Cassia", "Marigold", "Delphine", "Favour",
];

export const products: MockProduct[] = names.map((n, i) => {
  const cat = categories[i % categories.length];
  const pool = poolFor(cat.slug);
  const base = 850000 + (i % 9) * 320000; // kobo -> ~₦8,500 to ~₦34,100
  const onSale = i % 4 === 0;
  const start = Math.floor(i / categories.length) % pool.length;
  const gallery = [0, 1, 2].map((k) => pool[(start + k) % pool.length]);
  return {
    slug: `${cat.slug}-${n.toLowerCase()}`,
    name: `${n} ${cat.name.replace(/s$/, "")}`,
    categorySlug: cat.slug,
    priceKobo: onSale ? Math.round(base * 0.9) : base,
    compareAtKobo: onSale ? base : undefined,
    image: gallery[0],
    images: gallery,
    badge: onSale ? "sale" : i % 3 === 0 ? "bestseller" : i % 5 === 0 ? "new" : undefined,
    rating: 4 + ((i * 7) % 10) / 10,
    description:
      "Hand-finished in gold-tone and cubic zirconia, made to layer and last. Tarnish-resistant, hypoallergenic posts, and a 60-day sparkle guarantee.",
  };
});

export const featuredProducts = products.slice(0, 8);
export const bestsellers = products.filter((p) => p.badge === "bestseller").slice(0, 8);
export const newArrivals = products.filter((p) => p.badge === "new").slice(0, 8);
export const onSale = products.filter((p) => p.badge === "sale").slice(0, 8);

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export const testimonials = [
  { name: "Tolu A.", location: "Lagos", quote: "My chain came in 2 days and hasn't faded once. Obsessed." },
  { name: "Ngozi E.", location: "Abuja", quote: "The party earrings got me so many compliments at the owambe." },
  { name: "Halima B.", location: "Ibadan", quote: "Packaging felt luxury. You can tell they care." },
  { name: "Chiamaka O.", location: "Port Harcourt", quote: "Bought 3 stacks of knuckle rings. Quality is unmatched for the price." },
  { name: "Funke D.", location: "Lagos", quote: "Walked into the store and left with half the display. Worth it." },
];
