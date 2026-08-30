import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { HomeBrandStrip } from "@/components/brand/home-brand-strip";

export default function StorefrontLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader announcement={<AnnouncementBar />} />
      <main className="flex-1">{children}</main>
      <HomeBrandStrip />
      <SiteFooter />
      <CartDrawer />
    </>
  );
}
