"use client";

import * as React from "react";
import { Trash2, Plus } from "lucide-react";
import { saveAnnouncement, deleteAnnouncement } from "@/server/actions/announcement";
import { TextInput, useAction } from "@/components/admin/form";
import { Panel, EmptyState } from "@/components/admin/ui";

type Row = { id: string; text: string; active: boolean; sortOrder: number };

function Line({ row, onSaved }: { row: Row | null; onSaved: () => void }) {
  const [text, setText] = React.useState(row?.text ?? "");
  const [active, setActive] = React.useState(row?.active ?? true);
  const [order, setOrder] = React.useState(String(row?.sortOrder ?? 0));
  const save = useAction(() => saveAnnouncement(row?.id ?? null, { text, active, sortOrder: order }), {
    success: row ? "Updated" : "Added",
    onDone: () => {
      if (!row) setText("");
      onSaved();
    },
  });
  const del = useAction(deleteAnnouncement, { success: "Deleted", onDone: onSaved });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.run();
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <TextInput
        className="min-w-52 flex-1"
        value={text}
        placeholder="Complimentary gift on orders over ₦30,000"
        onChange={(e) => setText(e.target.value)}
        required
      />
      <TextInput
        type="number"
        className="w-16"
        value={order}
        onChange={(e) => setOrder(e.target.value)}
        aria-label="Sort order"
      />
      <label className="flex items-center gap-1.5 text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> On
      </label>
      <button
        type="submit"
        disabled={save.pending}
        className="rounded-md border border-border px-3 py-2 text-xs font-medium uppercase tracking-wide hover:bg-secondary disabled:opacity-60"
      >
        {row ? "Save" : "Add"}
      </button>
      {row && (
        <button
          type="button"
          aria-label="Delete"
          disabled={del.pending}
          onClick={() => del.run(row.id)}
          className="grid size-9 place-items-center rounded-md text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </form>
  );
}

export function AnnouncementsManager({ rows }: { rows: Row[] }) {
  const [, force] = React.useReducer((x) => x + 1, 0);
  return (
    <Panel className="space-y-4">
      <p className="text-sm text-muted-foreground">
        These scroll across the top bar of every page. Lower sort order shows first.
      </p>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Plus className="size-4" /> New line
      </div>
      <Line row={null} onSaved={force} />
      <div className="h-px bg-border" />
      {rows.length === 0 ? (
        <EmptyState title="No announcements" />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Line key={r.id} row={r} onSaved={force} />
          ))}
        </div>
      )}
    </Panel>
  );
}
