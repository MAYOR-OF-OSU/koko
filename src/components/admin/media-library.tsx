"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Link as LinkIcon, Copy, Trash2, Loader2 } from "lucide-react";
import { addMediaByUrl, deleteMedia, type MediaAssetLite } from "@/server/actions/media";
import { uploadMedia } from "@/lib/media-client";
import { Field, TextInput, SaveButton, useAction, inputClass } from "@/components/admin/form";
import { Panel, CardHeading } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Filter = "all" | "image" | "video";

export function MediaLibrary({ assets }: { assets: MediaAssetLite[] }) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<Filter>("all");
  const [busy, setBusy] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [name, setName] = React.useState("");

  const addUrl = useAction(() => addMediaByUrl({ url, name: name || undefined }), {
    success: "Added to the library",
    onDone: () => {
      setUrl("");
      setName("");
      router.refresh();
    },
  });
  const del = useAction((id: string) => deleteMedia(id), {
    success: "Deleted",
    onDone: () => router.refresh(),
  });

  async function upload(file: File) {
    setBusy(true);
    try {
      await uploadMedia(file);
      toast.success("Uploaded");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const shown = filter === "all" ? assets : assets.filter((a) => a.kind === filter);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <CardHeading title="Add by URL" />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addUrl.run();
            }}
            className="space-y-3"
          >
            <Field label="Image or video URL">
              <TextInput
                value={url}
                required
                placeholder="https://…"
                onChange={(e) => setUrl(e.target.value)}
              />
            </Field>
            <Field label="Name" hint="Optional label for the library">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Spring hero" />
            </Field>
            <SaveButton pending={addUrl.pending}>
              <LinkIcon className="size-3.5" /> Add URL
            </SaveButton>
          </form>
        </Panel>

        <Panel>
          <CardHeading title="Upload" />
          <p className="mb-3 text-sm text-muted-foreground">
            Images up to 8&nbsp;MB, videos up to 64&nbsp;MB. Stored under{" "}
            <code className="rounded bg-secondary px-1">/public/uploads</code> — fine for this server;
            move to object storage before deploying to serverless.
          </p>
          <label
            className={cn(
              inputClass,
              "flex cursor-pointer items-center justify-center gap-2 border-dashed py-6 text-muted-foreground hover:border-foreground",
            )}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            <span>{busy ? "Uploading…" : "Choose an image or video"}</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f);
                e.target.value = "";
              }}
            />
          </label>
        </Panel>
      </div>

      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg">Library ({assets.length})</h2>
          <div className="flex gap-1.5 text-xs">
            {(["all", "image", "video"] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-3 py-1 capitalize transition",
                  filter === f
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {f === "all" ? "All" : `${f}s`}
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
            Nothing here yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {shown.map((a) => (
              <div key={a.id} className="overflow-hidden rounded-lg border border-border">
                <div className="relative aspect-square bg-secondary/40">
                  {a.kind === "video" ? (
                    <video src={a.url} className="size-full object-cover" muted controls />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.url} alt={a.name} className="size-full object-cover" />
                  )}
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-background/90 px-2 py-0.5 text-[0.6rem] uppercase tracking-wide text-muted-foreground">
                    {a.source === "uploaded" ? "Upload" : "URL"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 p-2">
                  <span className="min-w-0 truncate text-xs" title={a.name}>
                    {a.name}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      aria-label="Copy URL"
                      onClick={() => {
                        navigator.clipboard?.writeText(a.url);
                        toast.success("URL copied");
                      }}
                      className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      <Copy className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete"
                      disabled={del.pending}
                      onClick={() => confirm(`Delete “${a.name}”?`) && del.run(a.id)}
                      className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
