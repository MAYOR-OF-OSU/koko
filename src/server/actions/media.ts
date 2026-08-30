"use server";

import { unlink } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { del as blobDel } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

type Result = { ok: true } | { ok: false; error: string };

const BLOB_HOST = /\.blob\.vercel-storage\.com\//i;

export type MediaAssetLite = {
  id: string;
  kind: "image" | "video";
  url: string;
  name: string;
  source: string;
  createdBy: string | null;
  createdAt: string;
};

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i;

/** For the library grid and the "pick from library" dialog. */
export async function listMedia(
  kind?: "image" | "video",
): Promise<{ ok: true; assets: MediaAssetLite[] } | { ok: false; error: string }> {
  try {
    await requirePermission("media:write");
    const rows = await prisma.mediaAsset.findMany({
      where: kind ? { kind } : undefined,
      orderBy: { createdAt: "desc" },
      take: 300,
    });
    return {
      ok: true,
      assets: rows.map((r) => ({
        id: r.id,
        kind: r.kind,
        url: r.url,
        name: r.name,
        source: r.source,
        createdBy: r.createdBy,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not load media" };
  }
}

const urlSchema = z.object({
  url: z.string().url().max(2000),
  name: z.string().max(120).optional(),
  kind: z.enum(["image", "video"]).optional(),
});

const registerSchema = z.object({
  url: z.string().url().max(2000).regex(BLOB_HOST, "Expected a Vercel Blob URL"),
  name: z.string().max(160).optional(),
  kind: z.enum(["image", "video"]),
  mime: z.string().max(120).optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
});

/** Called by the client right after a direct-to-Blob upload succeeds. Idempotent. */
export async function registerMedia(input: z.input<typeof registerSchema>): Promise<Result> {
  try {
    const session = await requirePermission("media:write");
    const d = registerSchema.parse(input);

    const existing = await prisma.mediaAsset.findFirst({ where: { url: d.url } });
    if (existing) {
      revalidatePath("/admin/media");
      return { ok: true };
    }

    const name = d.name?.trim() || d.url.split("/").pop()?.split("?")[0] || "asset";
    await prisma.mediaAsset.create({
      data: {
        kind: d.kind,
        url: d.url,
        name,
        mime: d.mime ?? null,
        sizeBytes: d.sizeBytes ?? null,
        source: "uploaded",
        createdById: session.user.id,
        createdBy: session.user.email,
      },
    });
    await logAudit({ action: "media.upload", target: name, meta: { kind: d.kind, sizeBytes: d.sizeBytes ?? null } });
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not register the upload" };
  }
}

export async function addMediaByUrl(input: z.input<typeof urlSchema>): Promise<Result> {
  try {
    const session = await requirePermission("media:write");
    const d = urlSchema.parse(input);
    const kind = d.kind ?? (VIDEO_EXT.test(d.url) ? "video" : "image");
    const name = d.name?.trim() || d.url.split("/").pop()?.split("?")[0] || "asset";

    await prisma.mediaAsset.create({
      data: {
        kind,
        url: d.url,
        name,
        source: "url",
        createdById: session.user.id,
        createdBy: session.user.email,
      },
    });
    await logAudit({ action: "media.add", target: name, meta: { kind, source: "url" } });
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not add the URL" };
  }
}

export async function deleteMedia(id: string): Promise<Result> {
  try {
    await requirePermission("media:write");
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) return { ok: false, error: "Not found" };

    if (asset.source === "uploaded") {
      if (asset.url.startsWith("/uploads/")) {
        try {
          await unlink(path.join(process.cwd(), "public", asset.url.replace(/^\//, "")));
        } catch {
          /* file already gone — fine */
        }
      } else if (BLOB_HOST.test(asset.url)) {
        try {
          await blobDel(asset.url);
        } catch {
          /* blob already gone or no token — fine */
        }
      }
    }
    await prisma.mediaAsset.delete({ where: { id } });
    await logAudit({ action: "media.delete", target: asset.name });
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete" };
  }
}
