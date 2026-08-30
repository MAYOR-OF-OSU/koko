import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/layout/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { getSetting, getStoreSettings } from "@/lib/site-content";
import { sanitizeHtml } from "@/lib/sanitize";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Timi's Jewels started small and grew by obsessing over finish, weight and follow-up.",
};

export default async function AboutPage() {
  const [c, store] = await Promise.all([getSetting("pages.about"), getStoreSettings()]);

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[16/7] overflow-hidden rounded-[1.75rem] bg-muted">
          <Image src={c.imageUrl} alt="Timi's Jewels studio" fill sizes="100vw" className="object-cover" />
        </div>
      </section>

      {c.bodyHtml && (
        <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <div
            className="text-[0.98rem] leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_h2]:mt-6 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-4"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(c.bodyHtml) }}
          />
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Reveal group className="grid gap-6 md:grid-cols-3">
          {c.values.map((v, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-heading text-lg">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 text-center sm:px-6">
        <div className="hairline mx-auto mb-8 max-w-xs" />
        <p className="text-muted-foreground">
          Visit us at <span className="text-foreground">{store.address}</span> or reach the team on{" "}
          <a href={`tel:${store.phones[0]}`} className="text-foreground underline underline-offset-4">
            {store.phones[0]}
          </a>
          .
        </p>
      </section>
    </>
  );
}
