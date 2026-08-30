"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { createProduct, updateProduct, type ProductInput } from "@/server/actions/product";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { MediaField } from "@/components/admin/media-field";
import { Field, TextInput, Select, SaveButton, useAction } from "@/components/admin/form";
import { Panel } from "@/components/admin/ui";

type Img = { url: string; alt: string };
type Variant = { name: string; sku: string; priceNaira: string; stock: string };

export type ProductFormValue = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  priceNaira: string;
  compareAtNaira: string;
  description: string;
  status: "draft" | "active" | "archived";
  featured: boolean;
  rating: string;
  images: Img[];
  variants: Variant[];
};

export function ProductForm({
  categories,
  initial,
}: {
  categories: { id: string; name: string }[];
  initial?: ProductFormValue;
}) {
  const router = useRouter();
  const [v, setV] = React.useState<ProductFormValue>(
    initial ?? {
      name: "",
      slug: "",
      categoryId: categories[0]?.id ?? "",
      priceNaira: "",
      compareAtNaira: "",
      description: "",
      status: "active",
      featured: false,
      rating: "5",
      images: [{ url: "", alt: "" }],
      variants: [
        { name: "Gold", sku: "", priceNaira: "", stock: "20" },
        { name: "Rose gold", sku: "", priceNaira: "", stock: "15" },
      ],
    },
  );

  const { pending, run } = useAction(
    async (payload: ProductInput) =>
      initial?.id ? updateProduct(initial.id, payload) : createProduct(payload),
    { success: initial?.id ? "Product updated" : "Product created", onDone: () => router.push("/admin/products") },
  );

  const set = <K extends keyof ProductFormValue>(k: K, val: ProductFormValue[K]) =>
    setV((s) => ({ ...s, [k]: val }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    run({
      name: v.name,
      slug: v.slug || undefined,
      categoryId: v.categoryId,
      priceNaira: v.priceNaira,
      compareAtNaira: v.compareAtNaira || undefined,
      description: v.description,
      status: v.status,
      featured: v.featured,
      rating: v.rating || "5",
      images: v.images.filter((i) => i.url.trim()).map((i) => ({ url: i.url.trim(), alt: i.alt })),
      variants: v.variants
        .filter((x) => x.name.trim())
        .map((x) => ({
          name: x.name.trim(),
          sku: x.sku || undefined,
          priceNaira: x.priceNaira || undefined,
          stock: x.stock || "0",
        })),
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Panel className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <TextInput value={v.name} onChange={(e) => set("name", e.target.value)} required />
          </Field>
          <Field label="Slug" hint="Leave blank to generate from the name">
            <TextInput value={v.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto" />
          </Field>
          <Field label="Category">
            <Select value={v.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={v.status} onChange={(e) => set("status", e.target.value as ProductFormValue["status"])}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>
          <Field label="Price (₦)">
            <TextInput
              type="number"
              min="1"
              value={v.priceNaira}
              onChange={(e) => set("priceNaira", e.target.value)}
              required
            />
          </Field>
          <Field label="Compare-at price (₦)" hint="Optional — shows a strikethrough">
            <TextInput
              type="number"
              min="0"
              value={v.compareAtNaira}
              onChange={(e) => set("compareAtNaira", e.target.value)}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={v.featured} onChange={(e) => set("featured", e.target.checked)} />
          Featured on the homepage
        </label>
      </Panel>

      <Panel>
        <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Description
        </p>
        <RichTextEditor value={v.description} onChange={(html) => set("description", html)} />
      </Panel>

      <Panel className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">Images</p>
          <button
            type="button"
            onClick={() => set("images", [...v.images, { url: "", alt: "" }])}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3.5" /> Add image
          </button>
        </div>
        {v.images.map((img, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <MediaField
              label={`Image ${i + 1}`}
              value={img.url}
              onChange={(url) => {
                const next = [...v.images];
                next[i] = { ...next[i], url };
                set("images", next);
              }}
            />
            <div className="mt-2 flex gap-2">
              <TextInput
                placeholder="alt text"
                value={img.alt}
                onChange={(e) => {
                  const next = [...v.images];
                  next[i] = { ...next[i], alt: e.target.value };
                  set("images", next);
                }}
              />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => set("images", v.images.filter((_, x) => x !== i))}
                className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Upload a file, paste a URL, or pick from the media library.
        </p>
      </Panel>

      <Panel className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">Variants</p>
          <button
            type="button"
            onClick={() =>
              set("variants", [...v.variants, { name: "", sku: "", priceNaira: "", stock: "0" }])
            }
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3.5" /> Add variant
          </button>
        </div>
        {v.variants.map((vr, i) => {
          const upd = (patch: Partial<Variant>) => {
            const next = [...v.variants];
            next[i] = { ...next[i], ...patch };
            set("variants", next);
          };
          return (
            <div key={i} className="grid grid-cols-[1fr_1fr_6rem_5rem_auto] gap-2">
              <TextInput placeholder="Name" value={vr.name} onChange={(e) => upd({ name: e.target.value })} />
              <TextInput placeholder="SKU" value={vr.sku} onChange={(e) => upd({ sku: e.target.value })} />
              <TextInput placeholder="₦ price" type="number" value={vr.priceNaira} onChange={(e) => upd({ priceNaira: e.target.value })} />
              <TextInput placeholder="Stock" type="number" value={vr.stock} onChange={(e) => upd({ stock: e.target.value })} />
              <button
                type="button"
                aria-label="Remove variant"
                onClick={() => set("variants", v.variants.filter((_, x) => x !== i))}
                className="grid size-9 place-items-center rounded-md text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        })}
      </Panel>

      <div className="flex items-center gap-3">
        <SaveButton pending={pending}>{initial?.id ? "Save product" : "Create product"}</SaveButton>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
