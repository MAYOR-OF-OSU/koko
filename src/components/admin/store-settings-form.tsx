"use client";

import * as React from "react";
import { saveSetting } from "@/server/actions/content";
import { Field, TextInput, SaveButton, useAction } from "@/components/admin/form";
import { Panel } from "@/components/admin/ui";
import type { StoreSettings } from "@/lib/site-content-defaults";

export function StoreSettingsForm({ initial }: { initial: StoreSettings }) {
  const [v, setV] = React.useState({
    ...initial,
    phones: initial.phones.join(", "),
    shippingNaira: String(initial.shippingKobo / 100),
    freeGiftNaira: String(initial.freeGiftThresholdKobo / 100),
    lowStock: String(initial.lowStockThreshold ?? 5),
  });
  const { pending, run } = useAction(
    () =>
      saveSetting("settings.store", {
        name: v.name,
        tagline: v.tagline,
        email: v.email,
        phones: v.phones.split(",").map((p) => p.trim()).filter(Boolean),
        whatsapp: v.whatsapp,
        instagram: v.instagram,
        address: v.address,
        currency: v.currency,
        shippingKobo: Math.round(Number(v.shippingNaira || 0) * 100),
        freeGiftThresholdKobo: Math.round(Number(v.freeGiftNaira || 0) * 100),
        lowStockThreshold: Math.max(0, Math.round(Number(v.lowStock || 0))),
        maintenance: v.maintenance,
      }),
    { success: "Settings saved" },
  );
  const set = (k: string, val: string | boolean) => setV((s) => ({ ...s, [k]: val }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); run(); }}>
      <Panel className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Store name"><TextInput value={v.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Tagline"><TextInput value={v.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
          <Field label="Email"><TextInput type="email" value={v.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Phones" hint="comma-separated"><TextInput value={v.phones} onChange={(e) => set("phones", e.target.value)} /></Field>
          <Field label="WhatsApp number" hint="intl format, e.g. 23490…"><TextInput value={v.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
          <Field label="Instagram URL"><TextInput value={v.instagram} onChange={(e) => set("instagram", e.target.value)} /></Field>
        </div>
        <Field label="Address"><TextInput value={v.address} onChange={(e) => set("address", e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Currency"><TextInput value={v.currency} onChange={(e) => set("currency", e.target.value)} /></Field>
          <Field label="Shipping fee (₦)"><TextInput type="number" value={v.shippingNaira} onChange={(e) => set("shippingNaira", e.target.value)} /></Field>
          <Field label="Free-gift threshold (₦)"><TextInput type="number" value={v.freeGiftNaira} onChange={(e) => set("freeGiftNaira", e.target.value)} /></Field>
          <Field label="Low-stock threshold" hint="Flag a variant at/below this count"><TextInput type="number" min="0" value={v.lowStock} onChange={(e) => set("lowStock", e.target.value)} /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={v.maintenance} onChange={(e) => set("maintenance", e.target.checked)} />
          Maintenance mode (storefront shows a holding page)
        </label>
        <SaveButton pending={pending}>Save settings</SaveButton>
      </Panel>
    </form>
  );
}
