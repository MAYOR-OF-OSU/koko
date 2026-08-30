import "server-only";
import { prisma } from "@/lib/prisma";
import { testimonials as mockTestimonials } from "@/lib/mock-data";
import {
  siteContentDefaults,
  type SiteSettingKey,
  type SiteSettingMap,
} from "@/lib/site-content-defaults";

/**
 * Storefront content readers. Every read merges the DB value over the default
 * and falls back to the default (or mock-data) on any error, so the site renders
 * even with no database.
 */

export async function getSetting<K extends SiteSettingKey>(key: K): Promise<SiteSettingMap[K]> {
  const fallback = siteContentDefaults[key];
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    if (!row) return fallback;
    return { ...fallback, ...(row.value as object) } as SiteSettingMap[K];
  } catch {
    return fallback;
  }
}

export const getStoreSettings = () => getSetting("settings.store");

export async function getTestimonials() {
  try {
    const rows = await prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length) {
      return rows.map((r) => ({
        name: r.name,
        location: r.location ?? "",
        quote: r.quote,
        rating: r.rating,
      }));
    }
  } catch {
    /* fall through */
  }
  return mockTestimonials.map((t) => ({ ...t, rating: 5 }));
}

export async function getAnnouncements() {
  try {
    const rows = await prisma.announcement.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length) return rows.map((r) => r.text);
  } catch {
    /* fall through */
  }
  return [
    "Complimentary gift on orders over ₦30,000",
    "Nationwide delivery in 2–4 days",
    "60-day sparkle guarantee",
    "Handmade with care",
  ];
}

export async function getJournalPosts() {
  try {
    return await prisma.journalPost.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getJournalPost(slug: string) {
  try {
    return await prisma.journalPost.findFirst({ where: { slug, status: "published" } });
  } catch {
    return null;
  }
}
