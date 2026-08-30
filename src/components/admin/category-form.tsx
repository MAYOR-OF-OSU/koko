"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory, deleteCategory } from "@/server/actions/category";
import { MediaField } from "@/components/admin/media-field";
import { Field, TextInput, SaveButton, useAction } from "@/components/admin/form";
import { Panel } from "@/components/admin/ui";

type Value = { id?: string; name: string; slug: string; blurb: string; image: string; sortOrder: string };

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function CategoryForm({ initial }: { initial?: Value }) {
  const router = useRouter();
  const [v, setV] = React.useState<Value>(
    initial ?? { name: "", slug: "", blurb: "", image: "", sortOrder: "0" },
  );
  const { pending, run } = useAction(
    async () => {
      const payload = { name: v.name, slug: v.slug || slugify(v.name), blurb: v.blurb, image: v.image, sortOrder: v.sortOrder };
      return initial?.id ? updateCategory(initial.id, payload) : createCategory(payload);
    },
    { success: initial?.id ? "Category updated" : "Category created", onDone: () => router.push("/admin/categories") },
  );
  const del = useAction(deleteCategory, { success: "Category deleted", onDone: () => router.push("/admin/categories") });

  const set = (k: keyof Value, val: string) => setV((s) => ({ ...s, [k]: val }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run();
      }}
    >
      <Panel className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <TextInput value={v.name} onChange={(e) => set("name", e.target.value)} required />
          </Field>
          <Field label="Slug" hint="Used in /shop?category=…">
            <TextInput value={v.slug} onChange={(e) => set("slug", e.target.value)} placeholder={slugify(v.name) || "auto"} />
          </Field>
        </div>
        <Field label="Blurb">
          <TextInput value={v.blurb} onChange={(e) => set("blurb", e.target.value)} placeholder="Delicate to statement" />
        </Field>
        <MediaField label="Image" value={v.image} onChange={(url) => set("image", url)} />
        <Field label="Sort order">
          <TextInput type="number" className="max-w-28" value={v.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
        </Field>
      </Panel>

      <div className="mt-5 flex items-center gap-3">
        <SaveButton pending={pending}>{initial?.id ? "Save category" : "Create category"}</SaveButton>
        {initial?.id && (
          <button
            type="button"
            disabled={del.pending}
            onClick={() => confirm("Delete this category?") && del.run(initial.id!)}
            className="text-sm text-destructive hover:underline"
          >
            Delete
          </button>
        )}
        <button type="button" onClick={() => router.push("/admin/categories")} className="text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>
    </form>
  );
}
