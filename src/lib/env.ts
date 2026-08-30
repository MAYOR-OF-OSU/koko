import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Central, validated environment config.
 *
 * Phase 1 runs on localhost with no live secrets, so every integration var is
 * optional. `features` below derives simple on/off flags from what is present —
 * UI and route handlers check these instead of reading `process.env` directly.
 */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z
      .string()
      .url()
      .default("postgresql://postgres:postgres@localhost:5432/timis_jewels?schema=public"),

    BETTER_AUTH_SECRET: z.string().min(1).default("dev-only-insecure-secret-change-me"),
    BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),

    ADMIN_EMAIL: z.string().email().default("admin@timisjewels.local"),
    ADMIN_PASSWORD: z.string().min(8).default("changeme123"),

    // Paystack (inert until provided)
    PAYSTACK_SECRET_KEY: z.string().optional(),
    PAYSTACK_WEBHOOK_SECRET: z.string().optional(),

    // SMTP (inert until provided — dev transport logs to console)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional(),

    // Cloudflare Images / R2 (inert until provided)
    CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
    CLOUDFLARE_IMAGES_TOKEN: z.string().optional(),
    R2_BUCKET: z.string().optional(),

    // Vercel Blob — media uploads go here when present (Vercel injects it once a
    // Blob store is connected); without it, uploads fall back to the local FS.
    BLOB_READ_WRITE_TOKEN: z.string().optional(),

    // Google OAuth (inert until both provided)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    PAYSTACK_WEBHOOK_SECRET: process.env.PAYSTACK_WEBHOOK_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_IMAGES_TOKEN: process.env.CLOUDFLARE_IMAGES_TOKEN,
    R2_BUCKET: process.env.R2_BUCKET,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  },
  // Let the app boot even if something is missing during early local dev.
  emptyStringAsUndefined: true,
  skipValidation:
    process.env.SKIP_ENV_VALIDATION === "1" || process.env.npm_lifecycle_event === "lint",
});

export const features = {
  paystack: Boolean(process.env.PAYSTACK_SECRET_KEY && process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY),
  /** true when the configured Paystack secret key is a test key (`sk_test_…`). */
  paystackTestMode: (process.env.PAYSTACK_SECRET_KEY ?? "").startsWith("sk_test_"),
  email: Boolean(process.env.SMTP_HOST),
  cloudflareImages: Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_IMAGES_TOKEN),
  /** true when Vercel Blob is connected — media uploads stream straight to it. */
  blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
};
