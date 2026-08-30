import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { BLUR_DATA_URL } from "@/lib/image-loader";
import { getSetting } from "@/lib/site-content";

export async function Pillars() {
  const c = await getSetting("home.story");

  return (
    <section className="mx-auto max-w-[100rem] px-4 py-24 sm:px-8">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal className="relative aspect-[5/6] overflow-hidden bg-muted">
          <Image
            src={c.imageUrl}
            alt="Timi's Jewels pieces laid out"
            fill
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        </Reveal>

        <Reveal>
          <span className="eyebrow">{c.eyebrow}</span>
          <h2 className="mt-4 max-w-md font-heading text-3xl leading-tight sm:text-4xl">{c.headline}</h2>
          <p className="mt-5 max-w-md text-muted-foreground">{c.body}</p>

          <dl className="mt-10 space-y-6">
            {c.values.map((item, i) => (
              <div key={i} className="border-t border-border pt-5">
                <dt className="font-heading text-lg">{item.k}</dt>
                <dd className="mt-1 max-w-sm text-sm text-muted-foreground">{item.v}</dd>
              </div>
            ))}
          </dl>

          <Link
            href={c.ctaHref}
            className="mt-10 inline-flex items-center gap-2 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-foreground transition hover:text-rose-deep"
          >
            {c.ctaLabel}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
