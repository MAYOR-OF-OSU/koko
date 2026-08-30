import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Tags,
  Boxes,
  BellRing,
  UserCog,
  Home,
  Quote,
  Megaphone,
  FileText,
  Newspaper,
  Image as ImageIcon,
  ScrollText,
  Inbox,
  Mail,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/lib/roles";

export type AdminLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  permission: Permission;
};
export type AdminGroup = { title: string; links: AdminLink[] };

export const adminNav: AdminGroup[] = [
  {
    title: "Store",
    links: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true, permission: "overview" },
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart, permission: "orders:read" },
      { href: "/admin/customers", label: "Customers", icon: Users, permission: "customers:read" },
    ],
  },
  {
    title: "Catalogue",
    links: [
      { href: "/admin/products", label: "Products", icon: Package, permission: "catalogue:write" },
      { href: "/admin/categories", label: "Categories", icon: Tags, permission: "catalogue:write" },
      { href: "/admin/stock", label: "Stock", icon: Boxes, permission: "stock:read" },
      { href: "/admin/alerts", label: "Stock alerts", icon: BellRing, permission: "alerts:raise" },
    ],
  },
  {
    title: "Content",
    links: [
      { href: "/admin/content/home", label: "Home", icon: Home, permission: "content:write" },
      { href: "/admin/content/testimonials", label: "Testimonials", icon: Quote, permission: "content:write" },
      { href: "/admin/content/announcements", label: "Announcements", icon: Megaphone, permission: "content:write" },
      { href: "/admin/content/pages", label: "Pages", icon: FileText, permission: "content:write" },
      { href: "/admin/content/journal", label: "Journal", icon: Newspaper, permission: "content:write" },
      { href: "/admin/media", label: "Media library", icon: ImageIcon, permission: "media:write" },
    ],
  },
  {
    title: "Inbox",
    links: [
      { href: "/admin/messages", label: "Messages", icon: Inbox, permission: "inbox:read" },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail, permission: "inbox:read" },
    ],
  },
  {
    title: "",
    links: [
      { href: "/admin/staff", label: "Staff & roles", icon: UserCog, permission: "staff:write" },
      { href: "/admin/audit", label: "Audit log", icon: ScrollText, permission: "audit:read" },
      { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings:write" },
    ],
  },
];

export function isActive(pathname: string, link: AdminLink) {
  return link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(link.href + "/");
}
