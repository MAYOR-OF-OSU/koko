import { env, features } from "@/lib/env";

const BASE = "https://api.paystack.co";

/**
 * Thin Paystack wrapper. Every call throws `PaystackNotConfigured` until keys
 * are present, so callers can surface a "coming soon" state instead of 500s.
 */
export class PaystackNotConfigured extends Error {
  constructor() {
    super("Paystack is not configured yet.");
    this.name = "PaystackNotConfigured";
  }
}

export const paystackEnabled = features.paystack;

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  if (!paystackEnabled) throw new PaystackNotConfigured();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Paystack ${path} -> ${res.status}`);
  return (await res.json()) as T;
}

export function initializeTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
}) {
  return call<{ data: { authorization_url: string; access_code: string; reference: string } }>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        amount: input.amountKobo,
        reference: input.reference,
        callback_url: input.callbackUrl,
        currency: "NGN",
      }),
    },
  );
}

export type PaystackVerifyData = {
  status: string; // "success" | "failed" | "abandoned" | "reversed" | ...
  reference: string;
  amount: number; // kobo
  currency: string;
  gateway_response: string | null;
  paid_at: string | null;
  channel: string | null;
};

export function verifyTransaction(reference: string) {
  return call<{ status: boolean; message: string; data: PaystackVerifyData }>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}
