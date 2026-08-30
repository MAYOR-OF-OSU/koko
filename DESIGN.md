# DESIGN.md — Timi's Jewels

The visual language for this codebase. Token, rule, and rationale in one place so
humans and agents change the UI without re-deriving it. Source of truth for values
is `src/app/globals.css`; this file explains intent.

---

## 1. Theme & atmosphere

Editorial jewelry brand — warm, quiet, confident. **Light-only** (no dark mode;
`.dark {}` was removed). Storefront is spacious and photographic; the `/admin`
dashboard is the same palette but **crisp and dense** — a professional tool, not a
landing page. Motion is functional, never decorative-for-its-own-sake.

## 2. Color & surfaces

Purple, single-accent, one gray family (all hues sit at ~313–315 in OKLCH so grays
read warm-plum, never blue). Defined as `oklch()` custom properties in
`:root`; consume the **token names**, never raw values.

| Token | Role | Value |
| --- | --- | --- |
| `--background` | page ground | `oklch(0.986 0.005 315)` — off-white, faint plum |
| `--foreground` | body text | `oklch(0.2 0.03 313)` — plum-black (never `#000`) |
| `--card` | raised surface | `oklch(1 0 0)` — pure white |
| `--primary` / `--rose-deep` | primary action, CTA text | `oklch(0.4 0.15 313)` — `#6E3482` |
| `--rose` / `--accent-gold` | accent, chart-1 | `oklch(0.58 0.13 315)` — `#A56ABD` orchid |
| `--secondary` / `--muted` | tints, hovers, wells | `oklch(0.955 0.016 315)` |
| `--border` / `--input` | hairlines | `oklch(0.9 0.016 315)` |
| `--cocoa` | dark inverse surface | `oklch(0.27 0.09 313)` |
| `--destructive` | danger only | `oklch(0.577 0.22 25)` |

Rules: one accent (orchid) — no competing colors. Semantic status colours
(`emerald`/`sky`/`amber`/`rose` at 100/800) are allowed **only** in `StatusBadge`
and the `DbDown` notice. Depth comes from **borders, not shadows** — do not stack
border + shadow + fill on the same element.

## 3. Typography

| Use | Family | Notes |
| --- | --- | --- |
| Headings, display, stat values | **Fraunces** (`--font-heading`, serif) | weight 400, `letter-spacing: -0.01em` |
| Body, labels, UI | **Outfit** (`--font-sans`) | |
| Code, IDs | Geist Mono (`--font-mono`) | |

- Numeric data (money, counts, dates in tables/stat cards) uses `tabular-nums`.
- Micro-labels (form fields, stat-card labels, nav group headers) are the one
  deliberate all-caps idiom: `text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground`.
  Everything else is **sentence case**.
- Kill orphans: `text-balance` on short headings, `text-pretty` on descriptions.
- Money is stored in integer **kobo**; render with `formatNaira()` (`src/lib/format.ts`).

## 4. Components & states

Admin primitives live in `src/components/admin/ui.tsx` (`AdminPage`, `Panel`,
`CardHeading`, `StatCard`, `Table` + `bare`, `THead/TH/TR/TD`, `EmptyState`,
`StatusBadge`, `DbDown`) and `src/components/admin/form.tsx` (`Field`, `TextInput`,
`TextArea`, `Select`, `SaveButton`, `useAction`). Reuse them — don't hand-roll.

Every interactive element must answer input:

| State | Treatment |
| --- | --- |
| Hover (buttons/links) | colour shift via `transition-colors` |
| Hover (table rows) | `background` tint, pointer devices only (`@media (hover:hover)`) |
| Press | `transform: scale(0.97)`, 140ms — `.admin-shell` covers `button`, `[type=submit]`, `a[data-press]` |
| Focus (keyboard) | `outline: 2px solid var(--ring)` offset 2px on links/buttons; soft `ring` on inputs |
| Disabled | `opacity-60`, `cursor-not-allowed` |
| Pending | `useAction` → spinner (0.7s) + sonner toast |
| Loading a page | `loading.tsx` skeleton, not a bare spinner |
| Empty | `EmptyState` with an icon + one line of what fills it |
| Error | inline (`{ ok:false, error }` → `toast.error`); `confirm()` for destructive actions |

No dead affordances — every control links somewhere, does something, or is visibly
disabled.

## 5. Layout & spacing

- Radius: `--radius: 0.375rem`. `rounded-lg` = containers, `rounded-md`/`rounded-sm`
  = inner elements. Tight and crisp; not pill-shaped (`StatusBadge` is `rounded-sm`).
- Admin content column: `max-w-7xl`, padding `p-4 sm:p-6 lg:p-8`.
- Vertical rhythm between blocks: `space-y-6` (panels), `gap-4` (grids), `space-y-4`
  (within a panel).
- Grids over flex-percentage math. Forms: `grid gap-4 sm:grid-cols-2` (± `lg:grid-cols-4`),
  full-width inputs, one column on mobile.
- Tables: `overflow-x-auto` wrapper + `min-w-[34rem]` inner — scroll on small screens,
  never crush. Use `<Table bare>` when the table sits inside a `<Panel>`.
- The admin shell fills the viewport at `lg+` only; on mobile it wraps its content so
  short pages don't leave an empty band.

## 6. Depth & elevation

Flat. Hairline `--border` separates surfaces; `bg-secondary/30` is the content
"well" behind white `--card` panels. Reserve `--cocoa` for deliberate dark inverse
sections (auth aside, storefront footer). No drop shadows in the admin.

## 7. Motion

Scoped to `.admin-shell`; all of it guarded by `prefers-reduced-motion` (motion off,
colour/opacity kept).

- Easing: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`. Never `ease-in` on UI.
- Durations: press 140ms · inputs/colours 150ms · dropdowns ≤ 250ms · first-paint
  stagger 280ms. Keep UI motion **< 300ms**.
- Only animate `transform` / `opacity`.
- `.admin-stagger` on a container cascades its children in once (50ms steps) — use
  sparingly (currently: Overview stat cards).
- Don't animate keyboard-repeated actions. Don't animate from `scale(0)` — start ≥
  `0.95` / `translateY(6px)` + opacity.
- Storefront motion (scroll reveals, marquee, ken-burns) is separate and already in
  `globals.css`; leave it.

## 8. Responsive

Breakpoints: `sm` 640 (grids go multi-column, secondary text appears), `lg` 1024
(admin sidebar ↔ mobile `Sheet` drawer). Use `min-h-svh` / `min-h-dvh`, never `vh`.
Touch targets ≥ 32px. Every destructive action confirms.

## 9. Working on this repo

- Match the surrounding code: Tailwind utilities + `cn()`, **no component-scoped CSS
  files** (shared rules go in `globals.css` `@layer`).
- Server Components for reads (wrap Prisma in `try/catch` → `<DbDown>`); mutations are
  `"use server"` actions in `src/server/actions/*` (guard → zod → prisma → `logAudit`
  → `revalidatePath` → `{ ok }`), driven from the client via `useAction`.
- Stack: Next 16 (App Router, Turbopack), Prisma 6, better-auth, shadcn base-nova
  (Base UI — no `asChild`), lucide 1.x, recharts 3, sonner.
- Verify with `pnpm typecheck && pnpm lint`. **Do not run `pnpm build` on a dev
  machine** — a stray production `.next` 404s `/api/auth/*` and breaks sign-in.
- Don't swap icon or component libraries; don't add dependencies for polish.
