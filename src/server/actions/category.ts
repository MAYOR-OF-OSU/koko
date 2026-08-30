"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

const assetUrl = z
  .string()
  .refine(
    (s) => s === "" || /^https?:\/\//.test(s) || s.startsWith("/"),
    "Enter a URL or upload a file",
  );

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  blurb: z.string().optional(),
  image: assetUrl.optional(),
  sortOrder: z.coerce.number().int().default(0),
});

type Result = { ok: true } | { ok: false; error: string };

function bump() {
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/", "layout");
}

export async function createCategory(input: z.input<typeof schema>): Promise<Result> {
  try {
    await requireAdmin();
    const d = schema.parse(input);
    await prisma.category.create({
      data: { name: d.name, slug: d.slug, blurb: d.blurb, image: d.image || null, sortOrder: d.sortOrder },
    });
    await logAudit({ action: "category.create", target: d.name });
    bump();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not create category" };
  }
}

export async function updateCategory(id: string, input: z.input<typeof schema>): Promise<Result> {
  try {
    await requireAdmin();
    const d = schema.parse(input);
    await prisma.category.update({
      where: { id },
      data: { name: d.name, slug: d.slug, blurb: d.blurb, image: d.image || null, sortOrder: d.sortOrder },
    });
    await logAudit({ action: "category.update", target: d.name });
    bump();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update category" };
  }
}

export async function deleteCategory(id: string): Promise<Result> {
  try {
    await requireAdmin();
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) return { ok: false, error: `Move or delete its ${count} product(s) first.` };
    const c = await prisma.category.delete({ where: { id } });
    await logAudit({ action: "category.delete", target: c.name });
    bump();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete category" };
  }
}
