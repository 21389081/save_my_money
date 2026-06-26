<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Agent Guide

This repository is **好好記帳**, a Traditional Chinese personal finance app built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase, Recharts, and Vitest.

Use this file as the project-specific collaboration guide for AI agents. The Next.js block above is managed separately; keep custom instructions outside the marker comments.

## First Steps

Before editing:

1. Read the relevant local Next.js docs under `node_modules/next/dist/docs/`.
2. Inspect the files that own the behavior you are changing.
3. Check existing tests for the same layer before adding new patterns.
4. Do not rely on terminal output that shows mojibake for Chinese text; read files as UTF-8 before judging copy or UI strings.

Useful Next.js docs for this project:

- `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
- `node_modules/next/dist/docs/01-app/02-guides/ai-agents.md`

## App Summary

The app lets users sign in with Google, manage money books, add income/expense transactions, track budget usage, and view monthly expense breakdowns.

Core routes:

- `/login`: Google OAuth entry point.
- `/auth/callback`: Supabase OAuth callback route handler.
- `/`: dashboard.
- `/ledgers`: money book management.
- `/transactions/new`: create transaction.
- `/transactions/[id]/edit`: edit or delete transaction.
- `/stats`: monthly category chart.
- `/settings`: user/settings actions.
- `/supabasetest`: development Supabase smoke test.

`app/(dashboard)` is a route group and does not appear in URLs.

## Architecture

Important files:

- `app/layout.tsx`: root layout, metadata, fonts, and `AppProvider`.
- `proxy.ts`: Next.js 16 Proxy entry point.
- `lib/supabase/proxy.ts`: refreshes Supabase auth cookies through `@supabase/ssr`.
- `lib/supabase/client.ts`: browser Supabase client.
- `lib/supabase/server.ts`: server Supabase client using `next/headers` cookies.
- `lib/supabase/repository.ts`: all database reads/writes for app state.
- `components/providers/app-provider.tsx`: auth hydration, reducer, and CRUD actions.
- `lib/app-state.ts`: reducer for local client state after Supabase operations.
- `lib/types.ts`: shared app data model.
- `lib/finance.ts`: budget, balance, monthly summary, and category calculations.
- `lib/validation.ts`: form validation.

## Next.js 16 Notes

- Use `proxy.ts`, not `middleware.ts`, unless local Next docs say otherwise.
- Only one root `proxy.ts` is supported. Move helper logic into modules and import it.
- `Route Handlers` live in `app/**/route.ts` and use Web `Request`/`Response` plus Next helpers.
- Server and Client Component boundaries matter. Add `"use client"` only when a file needs hooks, browser APIs, context, event handlers, or client navigation.
- For dynamic route APIs, verify the current `params` and `searchParams` conventions in the bundled docs before changing signatures.
- Do not import server-only helpers such as `next/headers` into Client Components.

## Supabase Rules

This app uses Supabase Auth and Database through `@supabase/ssr`.

Environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Rules:

- Never commit `.env*` files or real secrets.
- Never expose `service_role` or secret keys in `NEXT_PUBLIC_` variables.
- Use `supabase.auth.getUser()` or `getClaims()` for auth verification; do not trust client-only session state for authorization.
- Keep RLS enabled for tables exposed through the Supabase Data API.
- Policies must restrict rows by ownership. `TO authenticated` alone is not enough.
- If changing schema, update `lib/types.ts`, `lib/supabase/repository.ts`, README schema notes, and tests together.
- If changing auth or database behavior, verify against current Supabase docs/changelog when network/docs access is available.

Tables currently referenced by code:

- `user_data`
- `money_book`
- `transactions`
- `connection_smoke_tests`

## UI And Copy

- UI copy is Traditional Chinese (`zh-Hant`).
- Keep user-facing text natural and concise.
- Use existing CSS variables from `app/globals.css`.
- Prefer existing component patterns before adding abstractions.
- Use `lucide-react` for icons.
- Use `formatCurrency`, date helpers, and finance helpers instead of duplicating formatting or calculations.
- Keep mobile behavior in mind: the app has a desktop sidebar and mobile bottom navigation.

## Data And Domain Rules

- `money_book.how_much` represents the budget/base amount used in balance and progress calculations.
- Balance is calculated as budget plus income minus expenses.
- Budget usage counts expenses only.
- Transaction types are `"income"` and `"expense"`.
- Expense categories are defined in `CATEGORIES` in `lib/types.ts`.
- Income transactions should use `category: null`.
- Do not delete the last money book through UI behavior; current reducer and page logic preserve at least one.

## Testing

Run targeted tests for touched behavior, then broader checks when feasible:

```bash
npm run test
npm run lint
npm run build
```

Testing setup:

- Vitest config: `vitest.config.ts`
- Test setup: `vitest.setup.ts`
- DOM environment: jsdom
- Path alias: `@/*`

Add or update tests when changing:

- finance calculations
- validation
- auth callback/session mapping
- Supabase repository behavior
- provider hydration or CRUD actions
- pages/components with visible state transitions

## Known Traps

- PowerShell may display Chinese as mojibake. The files are UTF-8; use a UTF-8-safe read method before changing copy.
- `settings/page.tsx` currently contains copy that says Supabase/Google OAuth will be added later, but the code already uses Supabase and Google OAuth. Treat code as source of truth and update stale UI copy if touching that page.
- `/supabasetest` queries `connection_smoke_tests`; this route is for development diagnostics and may not belong in public production navigation.
- `transactions.update_at` is spelled without the second `d` in the current TypeScript type and repository payload. Confirm database column names before renaming.
- The root provider wraps the whole app, including `/login`, so auth hydration behavior can affect both public and protected routes.

## Git Hygiene

- Do not revert unrelated user changes.
- Do not modify generated directories such as `.next/` or `node_modules/`.
- Keep edits scoped to the requested behavior.
- Before finalizing a code change, report which verification commands were run and whether any could not be run.
