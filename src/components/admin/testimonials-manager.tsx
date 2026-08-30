"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { saveTestimonial, deleteTestimonial } from "@/server/actions/testimonial";
import { Field, TextInput, TextArea, Select, SaveButton, useAction } from "@/components/admin/form";
import { Panel, EmptyState } from "@/components/admin/ui";

type Row = {
  id: string;
  name: string;
  location: string | null;
  quote: string;
  rating: number;
  published: boolean;
  sortOrder: number;
};

function Editor({ row, onSaved }: { row: Row | null; onSaved: () => void }) {
  const [v, setV] = React.useState({
    name: row?.name ?? "",
    location: row?.location ?? "",
    quote: row?.quote ?? "",
    rating: String(row?.rating ?? 5),
    published: row?.published ?? true,
    sortOrder: String(row?.sortOrder ?? 0),
  });
  const save = useAction(() => saveTestimonial(row?.id ?? null, v), {
    success: row ? "Updated" : "Added",
    onDone: onSaved,
  });
  const del = useAction(deleteTestimonial, { success: "Deleted", onDone: onSaved });
  const set = (k: keyof typeof v, val: string | boolean) => setV((s) => ({ ...s, [k]: val }));

  return (
    <Panel className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_5rem_5rem]">
        <Field label="Name"><TextInput value={v.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label="Location"><TextInput value={v.location} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="Rating">
          <Select value={v.rating} onChange={(e) => set("rating", e.target.value)}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </Select>
        </Field>
        <Field label="Order"><TextInput type="number" value={v.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} /></Field>
      </div>
      <Field label="Quote"><TextArea value={v.quote} onChange={(e) => set("quote", e.target.value)} /></Field>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={v.published} onChange={(e) => set("published", e.target.checked)} /> Published
        </label>
        <form onSubmit={(e) => { e.preventDefault(); save.run(); }}>
          <SaveButton pending={save.pending}>{row ? "Save" : "Add testimonial"}</SaveButton>
        </form>
        {row && (
          <button
            type="button"
            disabled={del.pending}
            onClick={() => confirm("Delete this testimonial?") && del.run(row.id)}
            className="ml-auto grid size-9 place-items-center rounded-md text-muted-foreground hover:text-destructive"
            aria-label="Delete"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
    </Panel>
  );
}

export function TestimonialsManager({ rows }: { rows: Row[] }) {
  const [, force] = React.useReducer((x) => x + 1, 0);
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-3 font-heading text-lg">Add new</h2>
        <Editor row={null} onSaved={force} />
      </div>
      <div>
        <h2 className="mb-3 font-heading text-lg">All testimonials ({rows.length})</h2>
        {rows.length === 0 ? (
          <EmptyState title="None yet" />
        ) : (
          <div className="space-y-4">
            {rows.map((r) => (
              <Editor key={r.id} row={r} onSaved={force} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
