export type NavItem = { label: string; href: string; image?: string };

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/", image: "/hero/hero-editorial.jpg" },
  { label: "Shop", href: "/shop", image: "/shop/shop-banner.jpg" },
  { label: "Collections", href: "/collections", image: "/categories/necklaces.jpg" },
  { label: "About", href: "/about", image: "/shop/lifestyle-dark.jpg" },
  { label: "Contact", href: "/contact", image: "/products/fashion-earrings-1.jpg" },
  { label: "FAQ", href: "/faq", image: "/products/knuckle-rings-1.jpg" },
  { label: "Track order", href: "/track-order", image: "/products/leg-chains-1.jpg" },
];

export const footerNav = {
  shop: [
    { label: "Neck Chains", href: "/shop?category=neck-chains" },
    { label: "Fashion Earrings", href: "/shop?category=fashion-earrings" },
    { label: "Knuckle Rings", href: "/shop?category=knuckle-rings" },
    { label: "Bracelets & Bangles", href: "/shop?category=bracelets-bangles" },
    { label: "Leg Chains", href: "/shop?category=leg-chains" },
    { label: "All products", href: "/shop" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Journal", href: "/journal" },
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Track Order", href: "/track-order" },
    { label: "My account", href: "/account" },
  ],
  policies: [
    { label: "Shipping & delivery", href: "/faq#shipping" },
    { label: "Returns", href: "/faq#returns" },
    { label: "Privacy Policy", href: "/faq#privacy" },
    { label: "Terms of Service", href: "/faq#terms" },
  ],
};

// Fallback contact details for client components that can't call getStoreSettings()
// (the server-rendered footer/contact page use the live CMS values instead).
export const contact = {
  address: "Nationwide delivery",
  email: "hello@timisjewels.com",
  phones: ["09013804907", "07030810301"],
  whatsapp: "2349013804907",
  instagram: "https://instagram.com/timisjewels",
};
