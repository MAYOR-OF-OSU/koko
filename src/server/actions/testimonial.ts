"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(2),
  location: z.string().optional(),
  quote: z.string().min(5),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  published: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

type Result = { ok: true } | { ok: false; error: string };

function bump() {
  revalidatePath("/admin/content/testimonials");
  revalidatePath("/", "layout");
}

export async function saveTestimonial(id: string | null, input: z.input<typeof schema>): Promise<Result> {
  try {
    await requireAdmin();
    const d = schema.parse(input);
    if (id) await prisma.testimonial.update({ where: { id }, data: d });
    else await prisma.testimonial.create({ data: d });
    await logAudit({ action: "testimonial.save", target: d.name });
    bump();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save" };
  }
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  const t = await prisma.testimonial.delete({ where: { id } });
  await logAudit({ action: "testimonial.delete", target: t.name });
  bump();
}
