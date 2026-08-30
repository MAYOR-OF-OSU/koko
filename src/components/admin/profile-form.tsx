"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { updateMyProfile } from "@/server/actions/profile";
import { MediaField } from "@/components/admin/media-field";
import { Field, TextInput, SaveButton, useAction } from "@/components/admin/form";
import { Panel } from "@/components/admin/ui";

type Initial = {
  name: string;
  email: string;
  image: string;
};

export function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [v, setV] = React.useState<Initial>(initial);
  const set = (k: keyof Initial, val: string) => setV((s) => ({ ...s, [k]: val }));

  const { pending, run } = useAction(() => updateMyProfile(v), {
    success: "Profile updated",
    onDone: () => router.refresh(),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run();
      }}
    >
      <Panel className="space-y-4">
        <h2 className="font-heading text-base">Bio-data</h2>
        <MediaField label="Avatar" value={v.image} onChange={(url) => set("image", url)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <TextInput
              value={v.name}
              onChange={(e) => set("name", e.target.value)}
              required
              minLength={2}
            />
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              value={v.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </Field>
        </div>
        <SaveButton pending={pending}>Save profile</SaveButton>
      </Panel>
    </form>
  );
}

export function PasswordForm() {
  const [cur, setCur] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirmPw, setConfirmPw] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirmPw) {
      toast.error("New passwords don't match.");
      return;
    }
    setPending(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: cur,
        newPassword: next,
        revokeOtherSessions: true,
      });
      if (error) {
        toast.error(error.message ?? "Could not change your password");
        return;
      }
      toast.success("Password changed");
      setCur("");
      setNext("");
      setConfirmPw("");
    } catch {
      toast.error("Couldn't reach the server. Is the database running?");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Panel className="space-y-4">
        <h2 className="font-heading text-base">Password</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Current password">
            <TextInput
              type="password"
              value={cur}
              onChange={(e) => setCur(e.target.value)}
              required
              autoComplete="current-password"
            />
          </Field>
          <Field label="New password">
            <TextInput
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm new password">
            <TextInput
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
        </div>
        <SaveButton pending={pending}>Change password</SaveButton>
      </Panel>
    </form>
  );
}
