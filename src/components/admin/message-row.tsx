"use client";

import * as React from "react";
import { Trash2, Mail, MailOpen } from "lucide-react";
import { markMessageRead, deleteMessage } from "@/server/actions/message";
import { useAction } from "@/components/admin/form";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MessageRow({
  m,
}: {
  m: { id: string; name: string; email: string; message: string; read: boolean; createdAt: Date };
}) {
  const [open, setOpen] = React.useState(false);
  const read = useAction(markMessageRead, { success: "Updated" });
  const del = useAction(deleteMessage, { success: "Deleted" });

  return (
    <li className={cn("rounded-lg border border-border bg-card", !m.read && "border-l-2 border-l-rose-deep")}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!m.read) read.run(m.id, true);
        }}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        {m.read ? (
          <MailOpen className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <Mail className="size-4 shrink-0 text-rose-deep" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className={cn("truncate text-sm", !m.read && "font-medium")}>{m.name}</p>
            <span className="shrink-0 text-xs text-muted-foreground">{formatDate(m.createdAt)}</span>
          </div>
          <p className="truncate text-sm text-muted-foreground">{m.message}</p>
        </div>
      </button>
      {open && (
        <div className="border-t border-border p-4 text-sm">
          <p className="text-muted-foreground">
            <a href={`mailto:${m.email}`} className="text-foreground hover:underline">
              {m.email}
            </a>
          </p>
          <p className="mt-2 whitespace-pre-wrap">{m.message}</p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => read.run(m.id, !m.read)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark {m.read ? "unread" : "read"}
            </button>
            <button
              onClick={() => confirm("Delete this message?") && del.run(m.id)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" /> Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
