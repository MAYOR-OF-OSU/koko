"use client";

import { registerMedia } from "@/server/actions/media";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
]);

/**
 * Upload a media file and return its URL. Streams straight to Vercel Blob when a
 * Blob store is connected; otherwise falls back to the local-FS route (dev).
 * Throws on failure — callers should toast the message.
 */
export async function uploadMedia(
  file: File,
  name?: string,
): Promise<{ url: string; kind: "image" | "video" }> {
  const kind: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
  if (!ALLOWED.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  }

  // 1. Is direct-to-Blob available on this deployment?
  let blobEnabled = false;
  try {
    const probe = await fetch("/api/admin/media/upload", { method: "GET" });
    if (probe.ok) blobEnabled = Boolean((await probe.json()).blob);
  } catch {
    /* fall through to the local route */
  }

  // 2. Vercel Blob — client uploads straight to storage, bypassing the function body limit.
  if (blobEnabled) {
    const { upload } = await import("@vercel/blob/client");
    const blob = await upload(`media/${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/admin/media/upload",
      contentType: file.type || undefined,
    });
    const reg = await registerMedia({
      url: blob.url,
      name: name || file.name,
      kind,
      mime: file.type || undefined,
      sizeBytes: file.size,
    });
    if (!reg.ok) throw new Error(reg.error);
    return { url: blob.url, kind };
  }

  // 3. Local filesystem (dev only — read-only on Vercel).
  const fd = new FormData();
  fd.append("file", file);
  if (name) fd.append("name", name);
  const res = await fetch("/api/admin/media", { method: "POST", body: fd });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    asset?: { url: string };
    error?: string;
  };
  if (!res.ok || !json.ok || !json.asset) throw new Error(json.error || "Upload failed");
  return { url: json.asset.url, kind };
}
