import type { MetadataRoute } from "next";
import { products, categories } from "@/lib/mock-data";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const staticRoutes = ["", "/shop", "/about", "/contact", "/faq", "/track-order"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  return [
    ...staticRoutes,
    ...categories.map((c) => ({ url: `${base}/shop?category=${c.slug}`, lastModified: new Date() })),
    ...products.map((p) => ({ url: `${base}/shop/${p.slug}`, lastModified: new Date() })),
  ];
}
