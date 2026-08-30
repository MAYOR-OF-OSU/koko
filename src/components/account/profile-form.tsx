"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [value, setValue] = React.useState(name);
  const [pending, setPending] = React.useState(false);
  const dirty = value.trim() !== name.trim() && value.trim().length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty) return;
    setPending(true);
    try {
      const { error } = await authClient.updateUser({ name: value.trim() });
      if (error) {
        toast.error(error.message ?? "Could not save your profile");
        return;
      }
      toast.success("Profile updated");
      router.refresh();
    } catch {
      toast.error("Couldn't reach the server. Is the database running?");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-heading text-lg font-semibold">Profile</h2>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Name</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Email</span>
        <input
          value={email}
          disabled
          className="w-full cursor-not-allowed rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
        />
        <span className="text-xs text-muted-foreground">
          Contact us to change the email on your account.
        </span>
      </label>

      <button
        type="submit"
        disabled={!dirty || pending}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
      >
        {pending && <Loader2 className="size-3.5 animate-spin" />}
        Save changes
      </button>
    </form>
  );
}
