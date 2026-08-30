import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJournalPost } from "@/lib/site-content";
import { sanitizeHtml } from "@/lib/sanitize";
import { formatDate } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPost(slug);
  if (!post) return { title: "Not found" };
  return { title: post.title, description: post.excerpt ?? undefined };
}

export default async function JournalPostPage({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const post = await getJournalPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <Link href="/journal" className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground">
        ← Journal
      </Link>
      <p className="mt-8 text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
        {post.publishedAt ? formatDate(post.publishedAt) : ""}
      </p>
      <h1 className="mt-2 font-heading text-3xl sm:text-4xl">{post.title}</h1>
      {post.coverImage && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-muted">
          <Image src={post.coverImage} alt={post.title} fill sizes="672px" className="object-cover" />
        </div>
      )}
      <div
        className="mt-8 text-[0.98rem] leading-relaxed text-foreground/90 [&_a]:text-rose-deep [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-2xl [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p+p]:mt-4"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.contentHtml) }}
      />
    </article>
  );
}
