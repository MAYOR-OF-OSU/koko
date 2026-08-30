import { Star } from "lucide-react";
import { getTestimonials } from "@/lib/site-content";
import { Reveal, RevealItem } from "@/components/motion/reveal";

export async function Testimonials() {
  const rows = await getTestimonials();
  const shown = rows.slice(0, 3);

  return (
    <section className="mx-auto max-w-[100rem] px-4 py-24 sm:px-8">
      <div className="text-center">
        <span className="eyebrow">Reviews</span>
        <h2 className="mt-3 font-heading text-3xl sm:text-4xl">4.9 average from 2,000+ orders</h2>
      </div>

      <Reveal group className="mt-14 grid gap-10 sm:grid-cols-3">
        {shown.map((t, i) => (
          <RevealItem key={i} className="text-center">
            <div className="flex justify-center gap-1 text-accent-gold">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className={s < t.rating ? "size-3.5 fill-current" : "size-3.5"} />
              ))}
            </div>
            <blockquote className="mx-auto mt-5 max-w-xs font-heading text-lg leading-snug">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t.name}{t.location ? ` — ${t.location}` : ""}
            </figcaption>
          </RevealItem>
        ))}
      </Reveal>
    </section>
  );
}
