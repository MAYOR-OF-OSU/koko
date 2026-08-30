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
  title: z.string().min(2),
  slug: z.string().min(2),
  excerpt: z.string().optional(),
  coverImage: assetUrl.optional(),
  contentHtml: z.string().default(""),
  status: z.enum(["draft", "published"]).default("draft"),
});

type Result = { ok: true; id?: string } | { ok: false; error: string };

function bump(slug?: string) {
  revalidatePath("/admin/content/journal");
  revalidatePath("/journal");
  if (slug) revalidatePath(`/journal/${slug}`);
}

export async function saveJournalPost(id: string | null, input: z.input<typeof schema>): Promise<Result> {
  try {
    await requireAdmin();
    const d = schema.parse(input);
    const slug = d.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const publishedAt = d.status === "published" ? new Date() : null;
    const data = {
      title: d.title,
      slug,
      excerpt: d.excerpt,
      coverImage: d.coverImage || null,
      contentHtml: d.contentHtml,
      status: d.status,
      publishedAt,
    };
    const row = id
      ? await prisma.journalPost.update({ where: { id }, data })
      : await prisma.journalPost.create({ data });
    await logAudit({ action: "journal.save", target: row.title, meta: { status: d.status } });
    bump(row.slug);
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save" };
  }
}

export async function deleteJournalPost(id: string) {
  await requireAdmin();
  const row = await prisma.journalPost.delete({ where: { id } });
  await logAudit({ action: "journal.delete", target: row.title });
  bump();
}
