import { prisma } from "@/lib/prisma";
import { AdminPage, DbDown, EmptyState } from "@/components/admin/ui";
import { MessageRow } from "@/components/admin/message-row";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  let messages;
  try {
    messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  } catch {
    return (
      <AdminPage title="Messages">
        <DbDown area="Messages" />
      </AdminPage>
    );
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <AdminPage
      title="Messages"
      description={`${messages.length} total${unread ? ` · ${unread} unread` : ""}`}
    >
      {messages.length === 0 ? (
        <EmptyState title="Inbox is empty" hint="Contact-form submissions land here." />
      ) : (
        <ul className="space-y-2">
          {messages.map((m) => (
            <MessageRow key={m.id} m={m} />
          ))}
        </ul>
      )}
    </AdminPage>
  );
}
