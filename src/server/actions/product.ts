"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";
import { nairaToKobo } from "@/lib/format";

/** Accepts an absolute http(s) URL or a site-relative path (e.g. an uploaded /uploads/… file). */
const assetUrl = z
  .string()
  .min(1)
  .refine((s) => /^https?:\/\//.test(s) || s.startsWith("/"), "Enter a URL or upload a file");

const imageSchema = z.object({
  url: assetUrl,
  alt: z.string().optional().default(""),
});
const variantSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  priceNaira: z.coerce.number().optional(),
  stock: z.coerce.number().int().min(0).default(0),
});

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  categoryId: z.string().min(1),
  priceNaira: z.coerce.number().positive(),
  compareAtNaira: z.coerce.number().optional(),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).default("active"),
  featured: z.coerce.boolean().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  images: z.array(imageSchema).default([]),
  variants: z.array(variantSchema).default([]),
});

export type ProductInput = z.input<typeof productSchema>;
type Result = { ok: true; id?: string } | { ok: false; error: string };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function revalidate(slug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  if (slug) revalidatePath(`/shop/${slug}`);
}

export async function createProduct(input: ProductInput): Promise<Result> {
  try {
    await requireAdmin();
    const d = productSchema.parse(input);
    const slug = `${d.slug ? slugify(d.slug) : slugify(d.name)}-${Date.now().toString(36).slice(-4)}`;
    const p = await prisma.product.create({
      data: {
        name: d.name,
        slug,
        description: d.description,
        categoryId: d.categoryId,
        priceKobo: nairaToKobo(d.priceNaira),
        compareAtKobo: d.compareAtNaira ? nairaToKobo(d.compareAtNaira) : null,
        status: d.status,
        featured: Boolean(d.featured),
        rating: d.rating ?? 5,
        images: { create: d.images.map((img, i) => ({ url: img.url, alt: img.alt, sortOrder: i })) },
        variants: {
          create: d.variants.map((v) => ({
            name: v.name,
            sku: v.sku || null,
            priceKobo: v.priceNaira ? nairaToKobo(v.priceNaira) : null,
            stock: v.stock,
          })),
        },
      },
    });
    await logAudit({ action: "product.create", target: p.name });
    revalidate(p.slug);
    return { ok: true, id: p.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not create product" };
  }
}

export async function updateProduct(id: string, input: ProductInput): Promise<Result> {
  try {
    await requireAdmin();
    const d = productSchema.parse(input);
    const p = await prisma.product.update({
      where: { id },
      data: {
        name: d.name,
        slug: d.slug ? slugify(d.slug) : undefined,
        description: d.description,
        categoryId: d.categoryId,
        priceKobo: nairaToKobo(d.priceNaira),
        compareAtKobo: d.compareAtNaira ? nairaToKobo(d.compareAtNaira) : null,
        status: d.status,
        featured: Boolean(d.featured),
        rating: d.rating ?? 5,
        images: {
          deleteMany: {},
          create: d.images.map((img, i) => ({ url: img.url, alt: img.alt, sortOrder: i })),
        },
        variants: {
          deleteMany: {},
          create: d.variants.map((v) => ({
            name: v.name,
            sku: v.sku || null,
            priceKobo: v.priceNaira ? nairaToKobo(v.priceNaira) : null,
            stock: v.stock,
          })),
        },
      },
    });
    await logAudit({ action: "product.update", target: p.name });
    revalidate(p.slug);
    return { ok: true, id: p.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update product" };
  }
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const p = await prisma.product.delete({ where: { id } });
  await logAudit({ action: "product.delete", target: p.name });
  revalidate();
}

export async function setProductStatus(id: string, status: "draft" | "active" | "archived") {
  await requireAdmin();
  const p = await prisma.product.update({ where: { id }, data: { status } });
  await logAudit({ action: "product.status", target: p.name, meta: { status } });
  revalidate(p.slug);
}

export async function toggleProductFeatured(id: string, featured: boolean) {
  await requireAdmin();
  const p = await prisma.product.update({ where: { id }, data: { featured } });
  await logAudit({ action: "product.featured", target: p.name, meta: { featured } });
  revalidate(p.slug);
}
