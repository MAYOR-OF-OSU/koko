import type { Metadata } from "next";
import { MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ContactForm } from "@/components/contact/contact-form";
import { getStoreSettings } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions about an order, sizing or a bulk enquiry? Reach the Timi's Jewels team.",
};

export default async function ContactPage() {
  const contact = await getStoreSettings();
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to us"
        subtitle="Order help, sizing questions, wholesale enquiries — we usually reply within a day."
      />
      <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <ContactForm />
        </div>
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 text-accent-metal" />
            <div>
              <p className="font-medium">Store</p>
              <p className="text-sm text-muted-foreground">{contact.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 size-5 text-accent-metal" />
            <div>
              <p className="font-medium">Phone &amp; WhatsApp</p>
              {contact.phones.map((p) => (
                <p key={p} className="text-sm text-muted-foreground">
                  <a href={`tel:${p}`} className="hover:text-foreground">
                    {p}
                  </a>
                </p>
              ))}
            </div>
          </div>
          <a
            href={`https://wa.me/${contact.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="btn-fill inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            Message us on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
