"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { saveJournalPost, deleteJournalPost } from "@/server/actions/journal";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { MediaField } from "@/components/admin/media-field";
import { Field, TextInput, TextArea, Select, SaveButton, useAction } from "@/components/admin/form";
import { Panel } from "@/components/admin/ui";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export type JournalValue = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  contentHtml: string;
  status: "draft" | "published";
};

export function JournalForm({ initial }: { initial?: JournalValue }) {
  const router = useRouter();
  const [v, setV] = React.useState<JournalValue>(
    initial ?? { title: "", slug: "", excerpt: "", coverImage: "", contentHtml: "", status: "draft" },
  );
  const set = (k: keyof JournalValue, val: string) => setV((s) => ({ ...s, [k]: val }));

  const { pending, run } = useAction(
    () =>
      saveJournalPost(initial?.id ?? null, {
        title: v.title,
        slug: v.slug || slugify(v.title),
        excerpt: v.excerpt,
        coverImage: v.coverImage,
        contentHtml: v.contentHtml,
        status: v.status,
      }),
    { success: "Post saved", onDone: () => router.push("/admin/content/journal") },
  );
  const del = useAction(deleteJournalPost, {
    success: "Post deleted",
    onDone: () => router.push("/admin/content/journal"),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); run(); }} className="space-y-6">
      <Panel className="space-y-4">
        <Field label="Title"><TextInput value={v.title} onChange={(e) => set("title", e.target.value)} required /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug"><TextInput value={v.slug} placeholder={slugify(v.title) || "auto"} onChange={(e) => set("slug", e.target.value)} /></Field>
          <Field label="Status">
            <Select value={v.status} onChange={(e) => set("status", e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </Field>
        </div>
        <MediaField label="Cover image" value={v.coverImage} onChange={(url) => set("coverImage", url)} />
        <Field label="Excerpt"><TextArea value={v.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></Field>
      </Panel>

      <Panel>
        <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">Content</p>
        <RichTextEditor value={v.contentHtml} onChange={(html) => set("contentHtml", html)} />
      </Panel>

      <div className="flex items-center gap-3">
        <SaveButton pending={pending}>{initial?.id ? "Save post" : "Create post"}</SaveButton>
        {initial?.id && (
          <button
            type="button"
            disabled={del.pending}
            onClick={() => confirm("Delete this post?") && del.run(initial.id!)}
            className="text-sm text-destructive hover:underline"
          >
            Delete
          </button>
        )}
        <button type="button" onClick={() => router.push("/admin/content/journal")} className="text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>
    </form>
  );
}
