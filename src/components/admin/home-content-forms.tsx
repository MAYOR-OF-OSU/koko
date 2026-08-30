"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveSetting } from "@/server/actions/content";
import { MediaField } from "@/components/admin/media-field";
import { Field, TextInput, TextArea, SaveButton, useAction } from "@/components/admin/form";
import { Panel } from "@/components/admin/ui";
import type {
  HeroContent,
  MarqueeContent,
  StatsContent,
  PromoContent,
  StoryContent,
} from "@/lib/site-content-defaults";

function Section<T>({
  title,
  keyName,
  initial,
  render,
}: {
  title: string;
  keyName: Parameters<typeof saveSetting>[0];
  initial: T;
  render: (v: T, set: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  const [v, setV] = React.useState<T>(initial);
  const { pending, run } = useAction(() => saveSetting(keyName, v), { success: `${title} saved` });
  const set = (patch: Partial<T>) => setV((s) => ({ ...s, ...patch }));

  return (
    <Panel className="space-y-4">
      <h2 className="font-heading text-lg">{title}</h2>
      {render(v, set)}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <SaveButton pending={pending}>Save {title.toLowerCase()}</SaveButton>
      </form>
    </Panel>
  );
}

function ListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <TextInput
            value={it}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            aria-label="Remove"
            onClick={() => onChange(items.filter((_, x) => x !== i))}
            className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <Plus className="size-3.5" /> Add item
      </button>
    </div>
  );
}

export function HomeContentForms({
  hero,
  marquee,
  stats,
  promo,
  story,
}: {
  hero: HeroContent;
  marquee: MarqueeContent;
  stats: StatsContent;
  promo: PromoContent;
  story: StoryContent;
}) {
  return (
    <div className="space-y-6">
      <Section<HeroContent> title="Hero" keyName="home.hero" initial={hero} render={(v, set) => (
        <div className="space-y-4">
          <Field label="Eyebrow"><TextInput value={v.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} /></Field>
          <MediaField
            label="Fallback image"
            hint="Shown if the rotating hero images below are empty"
            value={v.imageUrl}
            onChange={(url) => set({ imageUrl: url })}
          />
          <div>
            <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Hero images (rotate every 3s)
            </p>
            <div className="space-y-2">
              {(v.images ?? []).map((src, i) => (
                <div key={i} className="flex gap-2">
                  <TextInput
                    value={src}
                    placeholder="https://… or /uploads/…"
                    onChange={(e) => {
                      const n = [...(v.images ?? [])];
                      n[i] = e.target.value;
                      set({ images: n });
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => set({ images: (v.images ?? []).filter((_, x) => x !== i) })}
                    className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => set({ images: [...(v.images ?? []), ""] })}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="size-3.5" /> Add image
              </button>
            </div>
          </div>
          <Field label="Headline"><TextInput value={v.headline} onChange={(e) => set({ headline: e.target.value })} /></Field>
          <Field label="Body"><TextArea value={v.body} onChange={(e) => set({ body: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary CTA label"><TextInput value={v.primaryCtaLabel} onChange={(e) => set({ primaryCtaLabel: e.target.value })} /></Field>
            <Field label="Primary CTA link"><TextInput value={v.primaryCtaHref} onChange={(e) => set({ primaryCtaHref: e.target.value })} /></Field>
            <Field label="Secondary CTA label"><TextInput value={v.secondaryCtaLabel} onChange={(e) => set({ secondaryCtaLabel: e.target.value })} /></Field>
            <Field label="Secondary CTA link"><TextInput value={v.secondaryCtaHref} onChange={(e) => set({ secondaryCtaHref: e.target.value })} /></Field>
          </div>
          <div>
            <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">Stats</p>
            <div className="space-y-2">
              {v.stats.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <TextInput className="max-w-32" value={s.value} onChange={(e) => { const n = [...v.stats]; n[i] = { ...n[i], value: e.target.value }; set({ stats: n }); }} />
                  <TextInput value={s.label} onChange={(e) => { const n = [...v.stats]; n[i] = { ...n[i], label: e.target.value }; set({ stats: n }); }} />
                  <button type="button" aria-label="Remove" onClick={() => set({ stats: v.stats.filter((_, x) => x !== i) })} className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
              ))}
              <button type="button" onClick={() => set({ stats: [...v.stats, { value: "", label: "" }] })} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="size-3.5" /> Add stat</button>
            </div>
          </div>
        </div>
      )} />

      <Section<MarqueeContent> title="Marquee" keyName="home.marquee" initial={marquee} render={(v, set) => (
        <ListEditor items={v.items} onChange={(items) => set({ items })} placeholder="Handmade with care" />
      )} />

      <Section<StatsContent> title="Stats band" keyName="home.stats" initial={stats} render={(v, set) => (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
            Show the animated stats band on the homepage
          </label>
          <Field label="Eyebrow"><TextInput value={v.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} /></Field>
          <div>
            <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Stats <span className="normal-case tracking-normal">— the number in each value counts up on scroll (e.g. “2000+”, “48h”)</span>
            </p>
            <div className="space-y-2">
              {v.items.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <TextInput className="max-w-32" value={s.value} placeholder="2000+" onChange={(e) => { const n = [...v.items]; n[i] = { ...n[i], value: e.target.value }; set({ items: n }); }} />
                  <TextInput value={s.label} placeholder="Happy clients" onChange={(e) => { const n = [...v.items]; n[i] = { ...n[i], label: e.target.value }; set({ items: n }); }} />
                  <button type="button" aria-label="Remove" onClick={() => set({ items: v.items.filter((_, x) => x !== i) })} className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
              ))}
              <button type="button" onClick={() => set({ items: [...v.items, { value: "", label: "" }] })} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="size-3.5" /> Add stat</button>
            </div>
          </div>
        </div>
      )} />

      <Section<PromoContent> title="Promo banner" keyName="home.promo" initial={promo} render={(v, set) => (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.active} onChange={(e) => set({ active: e.target.checked })} /> Show the promo band
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Eyebrow"><TextInput value={v.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} /></Field>
            <Field label="Ends at" hint="Blank = rolling 6-day countdown"><TextInput type="datetime-local" value={v.endsAt} onChange={(e) => set({ endsAt: e.target.value })} /></Field>
          </div>
          <Field label="Headline"><TextInput value={v.headline} onChange={(e) => set({ headline: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="CTA label"><TextInput value={v.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value })} /></Field>
            <Field label="CTA link"><TextInput value={v.ctaHref} onChange={(e) => set({ ctaHref: e.target.value })} /></Field>
          </div>
        </div>
      )} />

      <Section<StoryContent> title="Story band" keyName="home.story" initial={story} render={(v, set) => (
        <div className="space-y-4">
          <Field label="Eyebrow"><TextInput value={v.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} /></Field>
          <MediaField label="Image" value={v.imageUrl} onChange={(url) => set({ imageUrl: url })} />
          <Field label="Headline"><TextInput value={v.headline} onChange={(e) => set({ headline: e.target.value })} /></Field>
          <Field label="Body"><TextArea value={v.body} onChange={(e) => set({ body: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="CTA label"><TextInput value={v.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value })} /></Field>
            <Field label="CTA link"><TextInput value={v.ctaHref} onChange={(e) => set({ ctaHref: e.target.value })} /></Field>
          </div>
          <div>
            <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">Values</p>
            <div className="space-y-2">
              {v.values.map((val, i) => (
                <div key={i} className="flex gap-2">
                  <TextInput className="max-w-44" value={val.k} onChange={(e) => { const n = [...v.values]; n[i] = { ...n[i], k: e.target.value }; set({ values: n }); }} />
                  <TextInput value={val.v} onChange={(e) => { const n = [...v.values]; n[i] = { ...n[i], v: e.target.value }; set({ values: n }); }} />
                  <button type="button" aria-label="Remove" onClick={() => set({ values: v.values.filter((_, x) => x !== i) })} className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
              ))}
              <button type="button" onClick={() => set({ values: [...v.values, { k: "", v: "" }] })} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="size-3.5" /> Add value</button>
            </div>
          </div>
        </div>
      )} />
    </div>
  );
}
