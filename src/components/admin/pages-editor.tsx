"use client";

import * as React from "react";
import { Plus, Trash2 } from "@/components/ui/icon";
import { saveSetting } from "@/server/actions/content";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Field, TextInput, TextArea, SaveButton, useAction } from "@/components/admin/form";
import { Panel } from "@/components/admin/ui";
import type { AboutContent, FaqContent } from "@/lib/site-content-defaults";

export function AboutEditor({ initial }: { initial: AboutContent }) {
  const [v, setV] = React.useState(initial);
  const { pending, run } = useAction(() => saveSetting("pages.about", v), { success: "About page saved" });
  const set = (patch: Partial<AboutContent>) => setV((s) => ({ ...s, ...patch }));

  return (
    <Panel className="space-y-4">
      <h2 className="font-heading text-lg">About page</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Eyebrow"><TextInput value={v.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} /></Field>
        <Field label="Image URL"><TextInput value={v.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} /></Field>
      </div>
      <Field label="Title"><TextInput value={v.title} onChange={(e) => set({ title: e.target.value })} /></Field>
      <Field label="Subtitle"><TextArea value={v.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></Field>
      <div>
        <p className="mb-1.5 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">Body</p>
        <RichTextEditor value={v.bodyHtml} onChange={(html) => set({ bodyHtml: html })} />
      </div>
      <div>
        <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">Values</p>
        <div className="space-y-2">
          {v.values.map((val, i) => (
            <div key={i} className="flex gap-2">
              <TextInput className="max-w-44" value={val.title} onChange={(e) => { const n = [...v.values]; n[i] = { ...n[i], title: e.target.value }; set({ values: n }); }} />
              <TextInput value={val.body} onChange={(e) => { const n = [...v.values]; n[i] = { ...n[i], body: e.target.value }; set({ values: n }); }} />
              <button type="button" aria-label="Remove" onClick={() => set({ values: v.values.filter((_, x) => x !== i) })} className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => set({ values: [...v.values, { title: "", body: "" }] })} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="size-3.5" /> Add value</button>
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); run(); }}>
        <SaveButton pending={pending}>Save about page</SaveButton>
      </form>
    </Panel>
  );
}

export function FaqEditor({ initial }: { initial: FaqContent }) {
  const [groups, setGroups] = React.useState(initial.groups);
  const { pending, run } = useAction(() => saveSetting("pages.faq", { groups }), { success: "FAQ saved" });

  const patchGroup = (gi: number, patch: Partial<FaqContent["groups"][number]>) =>
    setGroups((gs) => gs.map((g, i) => (i === gi ? { ...g, ...patch } : g)));
  const patchQa = (gi: number, qi: number, patch: Partial<{ q: string; a: string }>) =>
    setGroups((gs) =>
      gs.map((g, i) =>
        i === gi ? { ...g, qas: g.qas.map((qa, j) => (j === qi ? { ...qa, ...patch } : qa)) } : g,
      ),
    );

  return (
    <Panel className="space-y-5">
      <h2 className="font-heading text-lg">FAQ</h2>
      {groups.map((g, gi) => (
        <div key={gi} className="rounded-md border border-border p-4">
          <div className="flex items-center gap-2">
            <TextInput value={g.title} onChange={(e) => patchGroup(gi, { title: e.target.value })} placeholder="Section title" />
            <button type="button" aria-label="Remove section" onClick={() => setGroups((gs) => gs.filter((_, i) => i !== gi))} className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
          </div>
          <div className="mt-3 space-y-3">
            {g.qas.map((qa, qi) => (
              <div key={qi} className="space-y-1.5 border-l-2 border-border pl-3">
                <TextInput value={qa.q} onChange={(e) => patchQa(gi, qi, { q: e.target.value })} placeholder="Question" />
                <div className="flex gap-2">
                  <TextArea className="min-h-16" value={qa.a} onChange={(e) => patchQa(gi, qi, { a: e.target.value })} placeholder="Answer" />
                  <button type="button" aria-label="Remove" onClick={() => patchGroup(gi, { qas: g.qas.filter((_, j) => j !== qi) })} className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => patchGroup(gi, { qas: [...g.qas, { q: "", a: "" }] })} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="size-3.5" /> Add question</button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setGroups((gs) => [...gs, { id: `g${Date.now()}`, title: "", qas: [{ q: "", a: "" }] }])}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <Plus className="size-4" /> Add section
      </button>
      <form onSubmit={(e) => { e.preventDefault(); run(); }}>
        <SaveButton pending={pending}>Save FAQ</SaveButton>
      </form>
    </Panel>
  );
}
