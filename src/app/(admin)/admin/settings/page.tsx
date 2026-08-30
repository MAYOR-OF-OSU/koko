import { Check, X } from "@/components/ui/icon";
import { AdminPage, Panel } from "@/components/admin/ui";
import { getStoreSettings } from "@/lib/site-content";
import { features } from "@/lib/env";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";

export const dynamic = "force-dynamic";

const INTEGRATIONS = [
  { key: "paystack" as const, label: "Paystack payments", hint: "Set PAYSTACK_SECRET_KEY + NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY" },
  { key: "email" as const, label: "Transactional email", hint: "Set SMTP_HOST and related SMTP_* vars" },
  { key: "cloudflareImages" as const, label: "Cloudflare Images", hint: "Set CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_IMAGES_TOKEN" },
];

export default async function AdminSettingsPage() {
  const store = await getStoreSettings();

  return (
    <AdminPage title="Settings" description="Store details and integration status.">
      <div className="space-y-6">
        <StoreSettingsForm initial={store} />

        <Panel>
          <h2 className="font-heading text-lg">Integrations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Read-only — configured via environment variables (Doppler in production).
          </p>
          <ul className="mt-4 divide-y divide-border">
            {INTEGRATIONS.map((it) => {
              const on = features[it.key];
              const status = on
                ? it.key === "paystack"
                  ? features.paystackTestMode
                    ? "connected (test mode)"
                    : "connected (LIVE)"
                  : "connected"
                : "not configured";
              return (
                <li key={it.key} className="flex items-start gap-3 py-3">
                  <span
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                      on ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {on ? <Check className="size-3" /> : <X className="size-3" />}
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {it.label} — {status}
                    </p>
                    <p className="text-xs text-muted-foreground">{it.hint}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </AdminPage>
  );
}
