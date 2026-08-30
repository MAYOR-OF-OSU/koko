import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminPage, DbDown, EmptyState, StatusBadge, Table, THead, TH, TR, TD } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminJournalPage() {
  let posts;
  try {
    posts = await prisma.journalPost.findMany({ orderBy: { updatedAt: "desc" } });
  } catch {
    return (
      <AdminPage title="Journal">
        <DbDown area="Journal" />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Journal"
      description={`${posts.length} post${posts.length === 1 ? "" : "s"}`}
      actions={
        <Link
          href="/admin/content/journal/new"
          className="btn-fill inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-background"
        >
          <Plus className="size-3.5" /> New post
        </Link>
      }
    >
      {posts.length === 0 ? (
        <EmptyState title="No posts yet" hint="Write a piece for the /journal page." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Title</TH>
              <TH>Slug</TH>
              <TH>Status</TH>
              <TH>Updated</TH>
            </TR>
          </THead>
          <tbody>
            {posts.map((p) => (
              <TR key={p.id}>
                <TD>
                  <Link href={`/admin/content/journal/${p.id}`} className="font-medium hover:underline">
                    {p.title}
                  </Link>
                </TD>
                <TD className="text-muted-foreground">{p.slug}</TD>
                <TD>
                  <StatusBadge status={p.status} />
                </TD>
                <TD className="text-muted-foreground">{formatDate(p.updatedAt)}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </AdminPage>
  );
}
