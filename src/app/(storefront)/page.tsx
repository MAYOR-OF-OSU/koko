import { Hero } from "@/components/home/hero";
import { MarqueeBand } from "@/components/home/marquee-band";
import { StatsBand } from "@/components/home/stats-band";
import { CategoryStrip } from "@/components/home/category-strip";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Pillars } from "@/components/home/pillars";
import { Lookbook } from "@/components/home/lookbook";
import { PromoBanner } from "@/components/home/promo-banner";
import { Testimonials } from "@/components/home/testimonials";
import { NewsletterSection } from "@/components/home/newsletter";
import { getSetting, getStoreSettings } from "@/lib/site-content";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings();
  return {
    title: { absolute: `${s.name} — ${s.tagline}` },
    description:
      "Handpicked fashion jewelry — neck chains, earrings, rings, bracelets, anklets and more, finished by hand and delivered nationwide in days.",
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const stats = await getSetting("home.stats");

  return (
    <>
      <Hero />
      <MarqueeBand />
      <StatsBand content={stats} />
      <CategoryStrip />
      <FeaturedProducts />
      <Pillars />
      <Lookbook />
      <PromoBanner />
      <Testimonials />
      <NewsletterSection />
    </>
  );
}
