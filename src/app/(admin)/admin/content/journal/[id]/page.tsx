import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPage, DbDown } from "@/components/admin/ui";
import { JournalForm } from "@/components/admin/journal-form";

export const dynamic = "force-dynamic";

export default async function EditJournalPostPage({ params }: PageProps<"/admin/content/journal/[id]">) {
  const { id } = await params;
  let post;
  try {
    post = await prisma.journalPost.findUnique({ where: { id } });
  } catch {
    return (
      <AdminPage title="Edit post">
        <DbDown area="Editing posts" />
      </AdminPage>
    );
  }
  if (!post) notFound();

  return (
    <AdminPage title="Edit post" description={post.title}>
      <JournalForm
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          coverImage: post.coverImage ?? "",
          contentHtml: post.contentHtml,
          status: post.status,
        }}
      />
    </AdminPage>
  );
}
