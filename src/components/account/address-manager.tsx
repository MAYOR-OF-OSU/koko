"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Star, Trash2, Pencil } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveAddress, deleteAddress, setDefaultAddress } from "@/server/actions/address";

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
};

type FormValue = Omit<Address, "id" | "isDefault"> & { isDefault: boolean };

const empty: FormValue = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  country: "Nigeria",
  isDefault: false,
};

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<string | null>(null); // id | "new" | null
  const [v, setV] = React.useState<FormValue>(empty);
  const [pending, start] = React.useTransition();
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const set = (k: keyof FormValue, val: string | boolean) => setV((s) => ({ ...s, [k]: val }));

  const openNew = () => {
    setV(empty);
    setEditing("new");
  };
  const openEdit = (a: Address) => {
    setV({ ...a });
    setEditing(a.id);
  };
  const close = () => setEditing(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await saveAddress(editing === "new" ? null : editing, v);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(editing === "new" ? "Address added" : "Address updated");
      close();
      router.refresh();
    });
  };

  const run = (id: string, fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) => {
    setBusyId(id);
    start(async () => {
      const res = await fn();
      setBusyId(null);
      if (!res.ok) toast.error(res.error ?? "Something went wrong");
      else {
        toast.success(ok);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      {addresses.length === 0 && editing === null && (
        <p className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center text-sm text-muted-foreground">
          No saved addresses yet. Add one to check out faster next time.
        </p>
      )}

      {addresses.map((a) => (
        <div
          key={a.id}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="text-sm">
            <p className="flex items-center gap-2 font-medium">
              {a.fullName}
              {a.isDefault && (
                <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-wide text-secondary-foreground">
                  Default
                </span>
              )}
            </p>
            <p className="mt-1 text-muted-foreground">
              {a.street}, {a.city}, {a.state}, {a.country}
            </p>
            <p className="text-muted-foreground">{a.phone}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3 text-sm">
            {!a.isDefault && (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(a.id, () => setDefaultAddress(a.id), "Default updated")}
                className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-foreground disabled:opacity-50"
              >
                {busyId === a.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Star className="size-3.5" />
                )}
                Make default
              </button>
            )}
            <button
              type="button"
              onClick={() => openEdit(a)}
              className="inline-flex items-center gap-1.5 text-muted-foreground transition hover:text-foreground"
            >
              <Pencil className="size-3.5" /> Edit
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (confirm(`Delete ${a.fullName}'s address?`))
                  run(a.id, () => deleteAddress(a.id), "Address deleted");
              }}
              className="inline-flex items-center gap-1.5 text-destructive transition hover:underline disabled:opacity-50"
            >
              <Trash2 className="size-3.5" /> Delete
            </button>
          </div>
        </div>
      ))}

      {editing === null ? (
        <Button type="button" variant="outline" className="gap-2" onClick={openNew}>
          <Plus className="size-4" /> Add an address
        </Button>
      ) : (
        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6"
        >
          <h3 className="font-heading text-lg">
            {editing === "new" ? "New address" : "Edit address"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="fullName" label="Full name" value={v.fullName} onChange={(x) => set("fullName", x)} />
            <Field id="phone" label="Phone" type="tel" value={v.phone} onChange={(x) => set("phone", x)} />
          </div>
          <Field id="street" label="Street address" value={v.street} onChange={(x) => set("street", x)} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="city" label="City" value={v.city} onChange={(x) => set("city", x)} />
            <Field id="state" label="State" value={v.state} onChange={(x) => set("state", x)} />
            <Field id="country" label="Country" value={v.country} onChange={(x) => set("country", x)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={v.isDefault}
              onChange={(e) => set("isDefault", e.target.checked)}
            />
            Use as my default delivery address
          </label>
          <div className="flex items-center gap-3">
            <Button type="submit" className="btn-fill gap-2" disabled={pending}>
              {pending && <Loader2 className="size-3.5 animate-spin" />}
              {editing === "new" ? "Add address" : "Save changes"}
            </Button>
            <button
              type="button"
              onClick={close}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}
