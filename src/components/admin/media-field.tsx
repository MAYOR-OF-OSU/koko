"use client";

import * as React from "react";
import { toast } from "sonner";
import { LinkIcon, Upload, Images, X, Loader2 } from "lucide-react";
import { listMedia, type MediaAssetLite } from "@/server/actions/media";
import { uploadMedia } from "@/lib/media-client";
import { Field, TextInput, inputClass } from "@/components/admin/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Mode = "url" | "upload" | "library";

export function MediaField({
  label,
  hint,
  value,
  onChange,
  kind = "image",
  className,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  kind?: "image" | "video";
  className?: string;
}) {
  const [mode, setMode] = React.useState<Mode>("url");
  const [busy, setBusy] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  async function upload(file: File) {
    setBusy(true);
    try {
      const { url } = await uploadMedia(file);
      onChange(url);
      toast.success("Uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const tab = (m: Mode, icon: React.ReactNode, text: string) => (
    <button
      type="button"
      onClick={() => (m === "library" ? setPickerOpen(true) : setMode(m))}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition",
        mode === m && m !== "library"
          ? "bg-foreground text-background"
          : "border border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {text}
    </button>
  );

  return (
    <Field label={label} hint={hint}>
      <div className={cn("space-y-2", className)}>
        {value && (
          <div className="relative w-fit overflow-hidden rounded-lg border border-border bg-secondary/40">
            {kind === "video" ? (
              <video src={value} className="h-28 w-44 object-cover" muted />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="h-28 w-44 object-cover" />
            )}
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Clear"
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-background/90 text-foreground/70 hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {tab("url", <LinkIcon className="size-3.5" />, "URL")}
          {tab("upload", <Upload className="size-3.5" />, "Upload")}
          {tab("library", <Images className="size-3.5" />, "Library")}
        </div>

        {mode === "url" && (
          <TextInput
            value={value}
            placeholder="https://… or /uploads/…"
            onChange={(e) => onChange(e.target.value)}
          />
        )}

        {mode === "upload" && (
          <label className={cn(inputClass, "flex cursor-pointer items-center gap-2 text-muted-foreground")}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            <span>{busy ? "Uploading…" : `Choose ${kind === "video" ? "a video" : "an image"}`}</span>
            <input
              type="file"
              accept={kind === "video" ? "video/*" : "image/*"}
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>

      <LibraryPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        kind={kind}
        onPick={(url) => {
          onChange(url);
          setPickerOpen(false);
        }}
      />
    </Field>
  );
}

function LibraryPicker({
  open,
  onOpenChange,
  kind,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  kind: "image" | "video";
  onPick: (url: string) => void;
}) {
  const [assets, setAssets] = React.useState<MediaAssetLite[] | null>(null);

  React.useEffect(() => {
    if (!open) return;
    let live = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset while the dialog re-opens
    setAssets(null);
    listMedia(kind).then((res) => {
      if (live) setAssets(res.ok ? res.assets : []);
    });
    return () => {
      live = false;
    };
  }, [open, kind]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pick from the media library</DialogTitle>
        </DialogHeader>
        {assets === null ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
        ) : assets.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nothing here yet — add media under Content → Media library.
          </p>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
            {assets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onPick(a.url)}
                className="group overflow-hidden rounded-lg border border-border text-left transition hover:border-foreground"
              >
                <span className="relative block aspect-square bg-secondary/40">
                  {a.kind === "video" ? (
                    <video src={a.url} className="size-full object-cover" muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.url} alt={a.name} className="size-full object-cover" />
                  )}
                </span>
                <span className="block truncate px-2 py-1.5 text-[0.7rem] text-muted-foreground">
                  {a.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
