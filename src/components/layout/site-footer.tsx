import Link from "next/link";
import type { ComponentType } from "react";
import { MapPin, Phone, Mail, MessageCircle } from "@/components/ui/icon";
import { Logo } from "@/components/brand/logo";
import { footerNav } from "@/lib/nav";
import { getStoreSettings } from "@/lib/site-content";

/** Local Nigerian number (0xxxxxxxxxx) → E.164 for a robust `tel:` href. */
const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "").replace(/^0/, "+234")}`;
/** Instagram URL → "@handle" for the visible label. */
const igHandle = (url: string) =>
  "@" + url.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/+$/, "");

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

/** One stacked icon-above-label contact tile. */
function ContactTile({
  icon: Icon,
  label,
  href,
  external,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <Icon className="size-4 shrink-0 text-accent-gold" />
      <span className="text-[0.72rem] leading-snug text-cocoa-foreground/70">{label}</span>
    </>
  );
  const cls = "flex flex-col items-center gap-1.5 text-center transition-colors hover:text-cocoa-foreground";
  if (!href) return <span className={cls}>{inner}</span>;
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className={cls}
    >
      {inner}
    </a>
  );
}

export async function SiteFooter() {
  const contact = await getStoreSettings();
  return (
    <footer className="bg-cocoa text-cocoa-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className="grid gap-x-6 gap-y-8 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" aria-label="Timi's Jewels home" className="inline-block">
              <Logo variant="lockup" className="h-8 text-cocoa-foreground" />
            </Link>
            <p className="mt-3 text-[0.8rem] leading-relaxed text-cocoa-foreground/70">
              Handpicked fashion jewelry, finished by hand and shipped nationwide — honest listings,
              secure checkout and nationwide delivery.
            </p>
          </div>

          {/* 3-up on mobile; unwraps into the 4-col grid at lg */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-6 lg:contents">
            <LinkColumn title="Shop" links={footerNav.shop} />
            <LinkColumn title="Company" links={footerNav.company} />
            <LinkColumn title="Policies" links={footerNav.policies} />
          </div>
        </div>

        {/* contact row — icon above label, evenly spread */}
        <div className="mt-9 flex flex-wrap items-start justify-center gap-x-10 gap-y-5 border-t border-cocoa-foreground/15 pt-6 sm:justify-between">
          <ContactTile icon={MapPin} label={contact.address} />
          {contact.phones.length > 0 && (
            <ContactTile icon={Phone} label={contact.phones.join("  ·  ")} href={telHref(contact.phones[0])} />
          )}
          {contact.email && (
            <ContactTile icon={Mail} label={contact.email} href={`mailto:${contact.email}`} />
          )}
          {contact.whatsapp && (
            <ContactTile
              icon={MessageCircle}
              label="WhatsApp"
              href={`https://wa.me/${contact.whatsapp}`}
              external
            />
          )}
          {contact.instagram && (
            <ContactTile
              icon={InstagramIcon}
              label={igHandle(contact.instagram)}
              href={contact.instagram}
              external
            />
          )}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-cocoa-foreground/15 pt-5 text-[0.68rem] text-cocoa-foreground/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Timi&rsquo;s Jewels. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {["Paystack", "Visa", "Mastercard", "Verve"].map((p) => (
              <span
                key={p}
                className="rounded-sm border border-cocoa-foreground/25 px-2 py-1 text-[0.6rem] uppercase tracking-wider text-cocoa-foreground/60"
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
