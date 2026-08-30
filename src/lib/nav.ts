export type NavItem = { label: string; href: string };

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Track order", href: "/track-order" },
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
  ],
  policies: [
    { label: "Shipping", href: "/faq#shipping" },
    { label: "Returns", href: "/faq#returns" },
    { label: "Privacy Policy", href: "/faq#privacy" },
    { label: "Terms of Service", href: "/faq#terms" },
  ],
};

export const contact = {
  address: "Nationwide delivery",
  phones: ["09013804907", "07030810301"],
  whatsapp: "2349013804907",
  instagram: "https://instagram.com/timisjewels",
};
