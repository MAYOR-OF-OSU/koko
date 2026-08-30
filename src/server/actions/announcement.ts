"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  text: z.string().min(2),
  active: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

type Result = { ok: true } | { ok: false; error: string };

function bump() {
  revalidatePath("/admin/content/announcements");
  revalidatePath("/", "layout");
}

export async function saveAnnouncement(id: string | null, input: z.input<typeof schema>): Promise<Result> {
  try {
    await requireAdmin();
    const d = schema.parse(input);
    if (id) await prisma.announcement.update({ where: { id }, data: d });
    else await prisma.announcement.create({ data: d });
    await logAudit({ action: "announcement.save", target: d.text.slice(0, 60) });
    bump();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save" };
  }
}

export async function deleteAnnouncement(id: string) {
  await requireAdmin();
  const a = await prisma.announcement.delete({ where: { id } });
  await logAudit({ action: "announcement.delete", target: a.text.slice(0, 60) });
  bump();
}
