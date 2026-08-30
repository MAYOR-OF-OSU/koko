import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { guardPage } from "@/lib/admin-guard";
import { ROLE_LABEL, type Role } from "@/lib/roles";
import { formatDate, timeAgo } from "@/lib/format";
import { AdminPage, DbDown, EmptyState, Table, THead, TH, TR, TD } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const PER_PAGE = 50;

const ACTION_LABEL: Record<string, string> = {
  "auth.login": "Signed in",
  "auth.logout": "Signed out",
  "product.create": "Created product",
  "product.update": "Updated product",
  "product.delete": "Deleted product",
  "product.status": "Changed product status",
  "product.featured": "Toggled featured",
  "category.create": "Created category",
  "category.update": "Updated category",
  "category.delete": "Deleted category",
  "content.save": "Saved content block",
  "journal.save": "Saved journal post",
  "journal.delete": "Deleted journal post",
  "testimonial.save": "Saved testimonial",
  "testimonial.delete": "Deleted testimonial",
  "announcement.save": "Saved announcement",
  "announcement.delete": "Deleted announcement",
  "message.read": "Marked message read",
  "message.delete": "Deleted message",
  "order.status": "Changed order status",
  "order.override": "Overrode order status",
  "order.fulfilment": "Updated delivery tracking",
  "checkout.init": "Started a checkout",
  "checkout.paid": "Payment confirmed",
  "payment.verify": "Verified a payment with Paystack",
  "payment.manual": "Marked an order paid manually",
  "payment.receipt.resend": "Re-sent a payment receipt",
  "stock.save": "Adjusted stock",
  "stock.alert.raise": "Raised a low-stock alert",
  "stock.alert.resolve": "Resolved a low-stock alert",
  "staff.role": "Changed a user's role",
  "staff.create": "Added a team member",
  "staff.remove": "Removed a team member",
  "staff.delete": "Deleted a user account",
  "profile.update": "Updated their profile",
  "media.add": "Added media (URL)",
  "media.upload": "Uploaded media",
  "media.delete": "Deleted media",
};

export default async function AdminAuditPage({ searchParams }: PageProps<"/admin/audit">) {
  await guardPage("audit:read");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  let events;
  let total = 0;
  try {
    [events, total] = await Promise.all([
      prisma.auditEvent.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
      }),
      prisma.auditEvent.count(),
    ]);
  } catch {
    return (
      <AdminPage title="Audit log">
        <DbDown area="The audit log" />
      </AdminPage>
    );
  }

  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <AdminPage
      title="Audit log"
      description={`${total} event${total === 1 ? "" : "s"} — sign-ins and every change made in the admin.`}
    >
      {events.length === 0 ? (
        <EmptyState title="No activity yet" hint="Sign-ins and admin changes will show up here." />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>When</TH>
                <TH>Who</TH>
                <TH>Action</TH>
                <TH>Target</TH>
                <TH>IP</TH>
              </TR>
            </THead>
            <tbody>
              {events.map((e) => (
                <TR key={e.id}>
                  <TD className="whitespace-nowrap text-muted-foreground">
                    <span title={formatDate(e.createdAt)}>{timeAgo(e.createdAt)}</span>
                  </TD>
                  <TD>
                    <span className="block">{e.actorEmail ?? "—"}</span>
                    {e.actorRole && (
                      <span className="text-xs text-muted-foreground">
                        {ROLE_LABEL[e.actorRole as Role] ?? e.actorRole}
                      </span>
                    )}
                  </TD>
                  <TD>{ACTION_LABEL[e.action] ?? e.action}</TD>
                  <TD className="text-muted-foreground">{e.target ?? "—"}</TD>
                  <TD className="text-muted-foreground">{e.ip ?? "—"}</TD>
                </TR>
              ))}
            </tbody>
          </Table>

          {pageCount > 1 && (
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {page} of {pageCount}
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/audit?page=${page - 1}`}
                    className="rounded-md border border-border px-3 py-1.5 hover:bg-secondary"
                  >
                    Previous
                  </Link>
                )}
                {page < pageCount && (
                  <Link
                    href={`/admin/audit?page=${page + 1}`}
                    className="rounded-md border border-border px-3 py-1.5 hover:bg-secondary"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </AdminPage>
  );
}
