import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { getJournalPosts } from "@/lib/site-content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Journal",
  description: "Notes on styling, care and the making of Timi's Jewels.",
};

export default async function JournalPage() {
  const posts = await getJournalPosts();

  return (
    <>
      <PageHero eyebrow="Journal" title="Notes & stories" />
      <section className="mx-auto max-w-[100rem] px-4 pb-28 sm:px-8">
        {posts.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">Nothing published yet — check back soon.</p>
        ) : (
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} href={`/journal/${p.slug}`} className="group">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {p.coverImage && (
                    <Image
                      src={p.coverImage}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-4 text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {p.publishedAt ? formatDate(p.publishedAt) : ""}
                </p>
                <h2 className="mt-1 font-heading text-xl">{p.title}</h2>
                {p.excerpt && <p className="mt-1.5 text-sm text-muted-foreground">{p.excerpt}</p>}
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
