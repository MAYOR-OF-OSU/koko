"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground/70 focus:border-foreground focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60";

export function TextInput(props: React.ComponentProps<"input">) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}
export function TextArea(props: React.ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(inputClass, "min-h-24", props.className)} />;
}
export function Select(props: React.ComponentProps<"select">) {
  return <select {...props} className={cn(inputClass, "h-[38px]", props.className)} />;
}

export function SaveButton({
  pending,
  children = "Save changes",
  className,
}: {
  pending?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "btn-fill inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-background disabled:opacity-60",
        className,
      )}
    >
      {pending && <Loader2 className="size-3.5 animate-spin" />}
      {children}
    </button>
  );
}

/** Wraps an action returning `{ok:true} | {ok:false;error}` with pending state + toasts. */
export function useAction<A extends unknown[]>(
  action: (...args: A) => Promise<{ ok: true } | { ok: false; error: string } | void>,
  opts?: { success?: string; onDone?: () => void },
) {
  const [pending, start] = React.useTransition();
  const run = React.useCallback(
    (...args: A) =>
      start(async () => {
        const res = await action(...args);
        if (res && res.ok === false) {
          toast.error(res.error);
        } else {
          toast.success(opts?.success ?? "Saved");
          opts?.onDone?.();
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [action],
  );
  return { pending, run };
}
