import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FooterNewsletter } from "@/components/layout/footer-newsletter";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { BackToTop } from "@/components/layout/back-to-top";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { HomeBrandStrip } from "@/components/brand/home-brand-strip";

export default function StorefrontLayout({ children }: LayoutProps<"/">) {
  return (
    // bg-cocoa is the base: any space the content doesn't fill (short pages, iOS
    // dvh under-reporting) reads as an extension of the footer, never a light void.
    <div className="flex min-h-dvh flex-1 flex-col bg-cocoa">
      <SiteHeader announcement={<AnnouncementBar />} />
      <main className="bg-background">{children}</main>
      {/* mt-auto pins this group to the bottom; its own bg keeps the brand strip's
          translucent tint reading correctly over light, not over cocoa.
          pb keeps the last footer row clear of the fixed mobile tab bar. */}
      <div className="mt-auto bg-background pb-16 lg:pb-0">
        <HomeBrandStrip />
        <FooterNewsletter />
        <SiteFooter />
      </div>
      <CartDrawer />
      <BackToTop />
      <MobileTabBar />
    </div>
  );
}
