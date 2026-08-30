import { Download, Mail } from "@/components/ui/icon";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { AdminPage, DbDown, EmptyState, Table, THead, TH, TR, TD } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  let subs;
  try {
    subs = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  } catch {
    return (
      <AdminPage title="Newsletter">
        <DbDown area="Newsletter" />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Newsletter"
      description={`${subs.length} subscriber${subs.length === 1 ? "" : "s"}`}
      actions={
        subs.length > 0 ? (
          <a
            href="/admin/newsletter/export"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-[0.75rem] font-medium uppercase tracking-[0.14em] hover:bg-secondary"
          >
            <Download className="size-3.5" /> Export CSV
          </a>
        ) : undefined
      }
    >
      {subs.length === 0 ? (
        <EmptyState
          icon={<Mail className="size-5" />}
          title="No subscribers yet"
          hint="Sign-ups from the storefront footer land here."
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Email</TH>
              <TH>Subscribed</TH>
            </TR>
          </THead>
          <tbody>
            {subs.map((s) => (
              <TR key={s.id}>
                <TD>{s.email}</TD>
                <TD className="text-muted-foreground">{formatDate(s.createdAt)}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </AdminPage>
  );
}
