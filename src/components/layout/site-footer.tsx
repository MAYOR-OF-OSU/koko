import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { NewsletterForm } from "@/components/home/newsletter";
import { footerNav } from "@/lib/nav";
import { getStoreSettings } from "@/lib/site-content";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-cocoa-foreground/50 sm:text-[0.68rem]">
        {title}
      </h3>
      <ul className="mt-2.5 space-y-1.5 text-[0.8rem] sm:text-[0.83rem]">
        {links.map((l) => (
          <li key={l.label + l.href}>
            <Link
              href={l.href}
              className="text-cocoa-foreground/80 transition-colors hover:text-cocoa-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function SiteFooter() {
  const contact = await getStoreSettings();
  return (
    <footer className="mt-10 bg-cocoa text-cocoa-foreground sm:mt-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="grid gap-x-6 gap-y-7 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo variant="lockup" className="h-8 text-cocoa-foreground" />
            <p className="mt-3 text-[0.8rem] leading-relaxed text-cocoa-foreground/70">
              Handpicked fashion jewelry, finished by hand and shipped nationwide.
            </p>
            <div className="mt-4">
              <NewsletterForm variant="footer" />
            </div>
          </div>

          {/* 3-up on mobile; unwraps into the 4-col grid at lg */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-6 lg:contents">
            <LinkColumn title="Shop" links={footerNav.shop} />
            <LinkColumn title="Company" links={footerNav.company} />
            <LinkColumn title="Policies" links={footerNav.policies} />
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-4 border-t border-cocoa-foreground/15 pt-5 text-xs text-cocoa-foreground/60 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0 text-accent-gold" />
            {contact.address}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="size-3.5 shrink-0 text-accent-gold" />
            {contact.phones.map((p, i) => (
              <span key={p}>
                <a href={`tel:${p}`} className="hover:text-cocoa-foreground">
                  {p}
                </a>
                {i < contact.phones.length - 1 && <span className="mx-1">·</span>}
              </span>
            ))}
          </span>
          <a
            href={contact.instagram}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-cocoa-foreground"
          >
            <InstagramIcon className="size-3.5 shrink-0 text-accent-gold" />
            @timisjewels
          </a>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-2 border-t border-cocoa-foreground/15 pt-4 text-[0.68rem] text-cocoa-foreground/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Timi&rsquo;s Jewels. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {["Paystack", "Visa", "Mastercard", "Verve"].map((p) => (
              <span
                key={p}
                className="rounded-sm border border-cocoa-foreground/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
