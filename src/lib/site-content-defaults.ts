/**
 * Default value for every editable SiteSetting key. These are the fallbacks the
 * storefront renders when a setting is unset or the DB is unreachable, and the
 * initial values the CMS forms are seeded with.
 */

export type HeroContent = {
  eyebrow: string;
  headline: string;
  body: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  imageUrl: string;
  /** rotated in the hero every ~3s; falls back to [imageUrl] when empty */
  images: string[];
  stats: { value: string; label: string }[];
};

export type MarqueeContent = { items: string[] };

export type StatsContent = {
  enabled: boolean;
  eyebrow: string;
  items: { value: string; label: string }[];
};

export type PromoContent = {
  active: boolean;
  eyebrow: string;
  headline: string;
  ctaLabel: string;
  ctaHref: string;
  /** ISO date string; countdown targets this. Empty = a rolling 6-day window. */
  endsAt: string;
};

export type StoryContent = {
  eyebrow: string;
  headline: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  values: { k: string; v: string }[];
};

export type LookbookContent = { picks: string[] };

export type AboutContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  bodyHtml: string;
  values: { title: string; body: string }[];
};

export type FaqContent = {
  groups: { id: string; title: string; qas: { q: string; a: string }[] }[];
};

export type StoreSettings = {
  name: string;
  tagline: string;
  email: string;
  phones: string[];
  whatsapp: string;
  instagram: string;
  address: string;
  currency: string;
  shippingKobo: number;
  freeGiftThresholdKobo: number;
  /** A variant at or below this stock count is flagged low; staff can alert the admin. */
  lowStockThreshold: number;
  maintenance: boolean;
};

export type SiteSettingMap = {
  "home.hero": HeroContent;
  "home.marquee": MarqueeContent;
  "home.stats": StatsContent;
  "home.promo": PromoContent;
  "home.story": StoryContent;
  "home.lookbook": LookbookContent;
  "pages.about": AboutContent;
  "pages.faq": FaqContent;
  "settings.store": StoreSettings;
};

export const siteContentDefaults: SiteSettingMap = {
  "home.hero": {
    eyebrow: "Welcoming the season with diamond & gold",
    headline: "Discover your sparkle",
    body: "Hand-finished chains, hoops, cuffs and rings — made to layer, made to last. Quietly luxurious, delivered nationwide in days.",
    primaryCtaLabel: "Shop Now",
    primaryCtaHref: "/shop",
    secondaryCtaLabel: "Explore",
    secondaryCtaHref: "/shop?sort=new",
    imageUrl: "/hero/hero-main.jpg",
    images: [
      "/hero/hero-main.jpg",
      "/hero/hero-editorial.jpg",
      "/hero/hero-alt.jpg",
      "/hero/hero-poster.jpg",
    ],
    stats: [
      { value: "500+", label: "Pieces curated" },
      { value: "2K+", label: "Happy clients" },
      { value: "60-Day", label: "Sparkle guarantee" },
    ],
  },
  "home.marquee": {
    items: [
      "Handmade with care",
      "Tarnish-resistant",
      "Hypoallergenic",
      "Nationwide delivery",
      "60-day sparkle guarantee",
      "Gift-wrapped",
    ],
  },
  "home.stats": {
    enabled: true,
    eyebrow: "The Timi's difference",
    items: [
      { value: "500+", label: "Pieces curated" },
      { value: "2000+", label: "Happy clients" },
      { value: "60", label: "Day sparkle guarantee" },
      { value: "48h", label: "Nationwide dispatch" },
    ],
  },
  "home.promo": {
    active: true,
    eyebrow: "Milestone Sale",
    headline: "Up to 10% off, because you made 60 days sparkle",
    ctaLabel: "Shop the sale",
    ctaHref: "/shop?sort=sale",
    endsAt: "",
  },
  "home.story": {
    eyebrow: "Our story",
    headline: "Made to be worn every day, kept for years",
    body: "Timi's Jewels began as a single display case. We grew by obsessing over the details most brands skip — finish, weight, packaging and follow-up.",
    imageUrl: "/story.jpg",
    ctaLabel: "Read our story",
    ctaHref: "/about",
    values: [
      { k: "Finish first", v: "Every piece inspected for plating, weight and clasp before it ships." },
      { k: "Fair pricing", v: "Direct sourcing — gallery quality without the gallery markup." },
      { k: "Real aftercare", v: "A 60-day sparkle guarantee and a human on WhatsApp when you need one." },
    ],
  },
  "home.lookbook": { picks: [] },
  "pages.about": {
    eyebrow: "Our story",
    title: "Redefining beauty, one piece at a time",
    subtitle:
      "What began as a single display case is now a nationwide jewelry brand — still run by the same people, with the same standards.",
    imageUrl: "/about.jpg",
    bodyHtml:
      "<p>Timi's Jewels started small and grew by word of mouth. Every collection is chosen and quality-checked in-house before it reaches you.</p>",
    values: [
      { title: "Finish first", body: "Every piece is inspected for plating, weight and clasp before it ships." },
      { title: "Fair pricing", body: "Direct sourcing means gallery-quality jewelry without the gallery markup." },
      { title: "Real aftercare", body: "A 60-day sparkle guarantee and a human on WhatsApp when you need one." },
    ],
  },
  "pages.faq": {
    groups: [
      {
        id: "shipping",
        title: "Shipping",
        qas: [
          { q: "How long does delivery take?", a: "Orders are dispatched within 24 hours. Nationwide delivery is typically 2–4 working days." },
          { q: "Do you ship internationally?", a: "Not yet — we're focused on fast, reliable nationwide delivery for now." },
          { q: "How much is shipping?", a: "Shipping is calculated at checkout by destination. Orders above ₦30,000 include a free gift." },
        ],
      },
      {
        id: "returns",
        title: "Returns & guarantee",
        qas: [
          { q: "What is the 60-day sparkle guarantee?", a: "If a piece tarnishes or fades within 60 days of normal wear, we replace it free." },
          { q: "Can I return an item I don't like?", a: "Unworn items in original packaging can be returned within 7 days for store credit." },
        ],
      },
      {
        id: "care",
        title: "Care",
        qas: [
          { q: "How do I keep pieces looking new?", a: "Keep them dry, take them off before swimming or the gym, and store them in the pouch provided." },
        ],
      },
      {
        id: "privacy",
        title: "Payments & privacy",
        qas: [
          { q: "How do I pay?", a: "Card, bank transfer and USSD via Paystack at checkout. Online payments are being switched on shortly." },
          { q: "Is my information safe?", a: "We only store what's needed to fulfil your order. See our privacy policy for details." },
        ],
      },
      {
        id: "terms",
        title: "Terms",
        qas: [{ q: "Where can I read your full terms?", a: "Full terms of service are published here and updated as the store grows." }],
      },
    ],
  },
  "settings.store": {
    name: "Timi's Jewels",
    tagline: "Elevating beauty to its finest",
    email: "hello@timisjewels.com",
    phones: ["09013804907", "07030810301"],
    whatsapp: "2349013804907",
    instagram: "https://instagram.com/timisjewels",
    address: "Nationwide delivery",
    currency: "NGN",
    shippingKobo: 250000,
    freeGiftThresholdKobo: 3000000,
    lowStockThreshold: 5,
    maintenance: false,
  },
};

export type SiteSettingKey = keyof SiteSettingMap;
