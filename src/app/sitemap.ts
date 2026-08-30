import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { products as mockProducts } from "@/lib/mock-data";
import { getJournalPosts } from "@/lib/site-content";
import { env } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/collections`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/journal`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/track-order`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Products — real DB rows, falling back to the mock catalogue if the DB is down.
  let productRoutes: MetadataRoute.Sitemap;
  try {
    const rows = await prisma.product.findMany({
      where: { status: "active" },
      select: { slug: true, updatedAt: true },
    });
    productRoutes = (rows.length ? rows : mockProducts.map((p) => ({ slug: p.slug, updatedAt: now }))).map(
      (p) => ({ url: `${base}/shop/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 }),
    );
  } catch {
    productRoutes = mockProducts.map((p) => ({
      url: `${base}/shop/${p.slug}`,
      lastModified: now,
      priority: 0.7,
    }));
  }

  // Published journal posts.
  let journalRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await getJournalPosts();
    journalRoutes = posts.map((p) => ({
      url: `${base}/journal/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      changeFrequency: "yearly",
      priority: 0.5,
    }));
  } catch {
    /* none */
  }

  return [...staticRoutes, ...productRoutes, ...journalRoutes];
}
