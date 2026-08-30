import { getSetting } from "@/lib/site-content";
import { InteractiveHoverLink } from "@/components/ui/interactive-hover-button";
import { HeroCategoryCards } from "@/components/home/hero-category-cards";
import { HeroCarousel } from "@/components/home/hero-carousel";

export async function Hero() {
  const c = await getSetting("home.hero");
  const picked = (c.images ?? []).map((s) => s.trim()).filter(Boolean);
  const images = picked.length ? picked : [c.imageUrl];

  return (
    <section className="relative">
      <div>
        <div className="relative isolate overflow-hidden rounded-b-[2rem] bg-cocoa">
          <HeroCarousel images={images} />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(20,10,26,0.6)_0%,rgba(20,10,26,0.3)_40%,rgba(20,10,26,0.72)_100%)]" />

          <div className="relative flex min-h-[88svh] flex-col justify-center px-6 pb-44 pt-36 text-white sm:px-12 lg:px-20">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-white/70">
              {c.eyebrow}
            </span>
            <h1 className="mt-5 max-w-3xl font-heading text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-[5rem]">
              {c.headline}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/80 sm:text-[0.95rem]">
              {c.body}
            </p>
            <div className="mt-9 flex items-center gap-2.5 sm:gap-3">
              <InteractiveHoverLink
                href={c.primaryCtaHref}
                variant="onDark"
                className="flex-1 justify-center px-4 sm:flex-initial sm:px-6"
              >
                {c.primaryCtaLabel}
              </InteractiveHoverLink>
              <InteractiveHoverLink
                href={c.secondaryCtaHref}
                variant="onDark"
                className="flex-1 justify-center px-4 sm:flex-initial sm:px-6"
              >
                {c.secondaryCtaLabel}
              </InteractiveHoverLink>
            </div>
          </div>
        </div>
      </div>

      <HeroCategoryCards />
    </section>
  );
}
