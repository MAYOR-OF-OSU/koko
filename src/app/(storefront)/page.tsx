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
import { getSetting } from "@/lib/site-content";

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
