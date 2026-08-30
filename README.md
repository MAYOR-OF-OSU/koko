# Timi's Jewels

E-commerce storefront for Timi's Jewels — a Nigerian fashion-jewelry brand
("Elevating beauty to its finest", Sagamu, Ogun State).

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind v4 + shadcn/ui
(base-nova / Base UI) · Prisma 6 + PostgreSQL 16 · BetterAuth · Zustand
cart · recharts + TipTap (admin) · Paystack (wired, off) · SMTP via Nodemailer (wired, off)
· Cloudflare Images/R2 (abstraction ready).

## Phase 1 status

Done: full marketing site with the reference-1 hero (rotating ghost wordmark via
`TextType`, stat row, cycling spotlight card), BubbleMenu nav, shop + product +
cart + checkout shell, auth (login/register/forgot), account dashboard, admin
dashboard with working product CRUD, About/Contact/FAQ/Track-order, light + dark
themes from the flyer palette, logo, SEO (metadata/sitemap/robots/JSON-LD).

Inert until secrets are added: Paystack checkout (`/api/checkout` returns 503),
transactional email (logs to console), Cloudflare image delivery (local
`/public` + picsum placeholders for now). The animated Prism background lives in
`src/components/ui/prism.tsx`, reserved for the admin dashboard.

## Getting started

```bash
pnpm install
cp .env.example .env          # defaults are fine for local

# database (needs Docker Desktop running)
pnpm db:up                    # PostgreSQL 16 on :5432
pnpm db:push                  # apply schema
pnpm db:seed                  # 7 categories, ~24 products, admin + demo client

pnpm dev                      # http://localhost:3000
```

Seeded accounts (from `.env`): `admin@timisjewels.local` / `changeme123` (admin),
`client@timisjewels.local` / `changeme123` (client).

Without Docker the marketing site, shop, cart and auth pages still render on mock
data (`src/lib/mock-data.ts`); only the admin data tables and real sign-in need
the database.

## Scripts

| Script | What |
|---|---|
| `pnpm dev` / `build` / `start` | Next.js (Turbopack) |
| `pnpm lint` / `pnpm typecheck` | ESLint / `tsc --noEmit` |
| `pnpm db:up` / `db:down` | PostgreSQL via docker compose |
| `pnpm db:push` / `db:migrate` / `db:seed` / `db:studio` | Prisma |

## Layout

```
src/app/
  (storefront)/   home, shop, shop/[slug], cart, checkout, about, contact, faq,
                  track-order, account/*   — shared header/footer/cart-drawer
  (auth)/         login, register, forgot-password
  (admin)/        admin/*  — role-gated (role === "admin")
  api/            auth/[...all], newsletter, contact, checkout, webhooks/paystack
src/components/   ui/ (shadcn + adapted react-bits), layout/, home/, shop/, cart/,
                  motion/, brand/, account/, admin/
src/lib/          auth, prisma, env, cart-store, format, image-loader, mail,
                  paystack, mock-data, nav
src/proxy.ts      Next 16 "proxy" (middleware) — optimistic auth gate
prisma/           schema.prisma (provider = postgresql), seed.ts
```

## Secrets (later)

Local uses `.env`. Staging/prod use Doppler: `doppler run -- pnpm build`
(`doppler.yaml` points at project `timis-jewels`). Fill in `PAYSTACK_*`,
`SMTP_*`, `CLOUDFLARE_*` to switch each integration on — `src/lib/env.ts`
derives `features.{paystack,email,cloudflareImages}` flags from their presence.
