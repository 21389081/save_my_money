<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Agent Guide

This repository is **好好記帳**, a Traditional Chinese personal finance app built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase, Recharts, and Vitest. Each money book has its own currency; the app formats amounts in that currency but does not perform currency conversion.

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

The app lets users sign in with Google, manage money books, choose a currency per book, add income/expense transactions, track balances and fund usage, and view monthly expense breakdowns. New users start with an empty state and must create their first money book; do not reintroduce demo or seeded finance data unless explicitly requested.

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
- `lib/auth/auth.ts`: starts Google OAuth.
- `lib/auth/auth-callback.ts`: exchanges the OAuth code and upserts `user_data`.
- `lib/auth/session.ts`: maps the verified Supabase user to the small UI session shape.
- `lib/types.ts`: shared app data model.
- `lib/finance.ts`: initial value, balance, fund usage, monthly summary, and category calculations.
- `lib/format.ts`: currency formatting and input symbols.
- `lib/date.ts`: local date/month keys and display formatting.
- `lib/validation.ts`: form validation.

## Runtime Data Flow

1. `AppProvider` creates the browser Supabase client and verifies the user with `auth.getUser()`.
2. When authenticated, `supabaseRepository.load()` fetches the user's money books first, then transactions belonging to those book IDs.
3. CRUD actions persist to Supabase before dispatching reducer actions. The reducer is the client-side view of confirmed database state, not the primary datastore.
4. `AppShell` waits for hydration and auth checks, then redirects unauthenticated dashboard users to `/login` on the client.
5. The root `proxy.ts` refreshes Supabase auth cookies through `getClaims()`; it is not the application's complete authorization layer.

The selected money book is local reducer state. On a fresh load, the first book ordered by `created_at` becomes selected; the selection is not persisted separately.

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
- Treat the app's `Session` type as display state only: it currently contains a name, not user identity or authorization claims.
- Keep RLS enabled for tables exposed through the Supabase Data API.
- Policies must restrict rows by ownership. `TO authenticated` alone is not enough.
- If changing schema, update `lib/types.ts`, `lib/supabase/repository.ts`, README schema notes, and tests together.
- If changing auth or database behavior, verify against current Supabase docs/changelog when network/docs access is available.
- Keep ownership checks in the database even when repository queries already filter by the current user.

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
- Preserve the established `money_book` naming when touching existing state and repository code; do not perform a broad camelCase rename as part of unrelated work.
- There is no configured formatter script. Match the surrounding file style and avoid whole-file formatting churn.

## Data And Domain Rules

- `money_book.how_much` represents the non-negative initial value of a money book. The field name is retained for database compatibility.
- Available funds are calculated as initial value plus all income. Balance is available funds minus all expenses.
- Fund usage is all expenses divided by available funds. When available funds are zero, usage is unavailable and the UI hides its percentage and progress bar.
- A negative balance is overdrawn and uses the expense color. Otherwise, usage above 70% uses the existing warning color; exactly 70% remains normal.
- Transaction types are `"income"` and `"expense"`.
- Expense categories are defined in `CATEGORIES` in `lib/types.ts`.
- Income transactions should use `category: null`.
- Currency is a money-book property. Supported codes are defined by `CURRENCIES`: `TWD`, `JPY`, `USD`, `EUR`, `CNY`, and `HKD`.
- New books default to `TWD` in the repository when no currency is supplied. Existing code allows a missing `currency_code` for compatibility and formatting also falls back to `TWD`.
- Never combine totals across money books with different currencies unless a conversion requirement and exchange-rate source are explicitly added.
- Do not delete the last money book through UI behavior. Both the page and reducer guard this invariant; repository methods are lower-level and do not enforce it themselves.
- Deleting a book deletes its transactions before deleting the book. Keep this order unless the confirmed database schema provides the intended cascading behavior.
- Repository/provider CRUD methods can reject. When changing interactive flows, preserve errors and add deliberate pending/error UI rather than silently swallowing failures.

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
- currency formatting or supported currencies
- validation
- auth callback/session mapping
- Supabase repository behavior
- provider hydration or CRUD actions
- pages/components with visible state transitions
- empty-user and last-money-book behavior

## Known Traps

- PowerShell may display Chinese as mojibake. The files are UTF-8; use a UTF-8-safe read method before changing copy.
- `settings/page.tsx` still describes a demo account/local data even though the app uses Supabase cloud data. Treat the implementation as source of truth and update that stale copy if touching the page.
- The current settings logout handler only clears local display state and redirects; it does not call `supabase.auth.signOut()`. Verify and correct the real Supabase sign-out flow if changing logout behavior.
- `resetData()` still exists in `AppProvider`, but the current settings UI does not expose a reset action. Do not assume README or older tests describe the visible settings controls exactly.
- `/supabasetest` queries `connection_smoke_tests`; this route is for development diagnostics and may not belong in public production navigation.
- `transactions.update_at` is spelled without the second `d` in the current TypeScript type/schema notes. Confirm the live database column before renaming it.
- The root provider wraps the whole app, including `/login`, so auth hydration behavior can affect both public and protected routes.
- Dashboard protection currently happens in the client `AppShell`. Do not describe `proxy.ts` as a server-side protected-route redirect without implementing and testing that behavior.

## Git Hygiene

- Do not revert unrelated user changes.
- Do not modify generated directories such as `.next/` or `node_modules/`.
- Keep edits scoped to the requested behavior.
- Before finalizing a code change, report which verification commands were run and whether any could not be run.
