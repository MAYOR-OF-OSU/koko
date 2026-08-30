import { getSetting } from "@/lib/site-content";
import { PromoBannerClient } from "@/components/home/promo-banner-client";

export async function PromoBanner() {
  const c = await getSetting("home.promo");
  if (!c.active) return null;

  return (
    <PromoBannerClient
      eyebrow={c.eyebrow}
      headline={c.headline}
      ctaLabel={c.ctaLabel}
      ctaHref={c.ctaHref}
      endsAtIso={c.endsAt}
    />
  );
}
