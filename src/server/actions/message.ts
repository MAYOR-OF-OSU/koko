"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

export async function markMessageRead(id: string, read: boolean) {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { read } });
  await logAudit({ action: "message.read", target: id, meta: { read } });
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  const m = await prisma.contactMessage.delete({ where: { id } });
  await logAudit({ action: "message.delete", target: m.name });
  revalidatePath("/admin/messages");
}
