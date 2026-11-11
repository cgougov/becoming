# Status

_Last updated: 2026-11-11 (M1, step 1)_

## Done

- **M0** — repo scaffold: Next.js 16 app, PWA basics, `npm run check`, CI, docs. Merged (#1).

## Current milestone: M1 — data, login, deploy (in progress)

Done (code side, no accounts needed):
- Schema in `supabase/migrations/20261111000000_init.sql`: `profiles`, `buckets`, `entries`,
  `check_ins`, `reflections`, `next_steps`; RLS owner-only on every table; new-user trigger
  creates the profile + the three starter buckets; private `photos` storage bucket with
  per-owner folder policies (`<user_id>/...`)
- Supabase clients (`src/lib/supabase/`): browser, server (cookies), and proxy (session refresh)
- `src/proxy.ts`: refreshes the session on every request; unauthenticated → `/login`
  (with `?next=`); signed-in users visiting `/login` → `/`. When Supabase env vars are
  missing the app still renders so CI/preview builds don't need secrets
- Magic-link login: `/login` (server action `signInWithOtp`), `/auth/callback` (PKCE code),
  `/auth/confirm` (token-hash template), `/auth/signout`
- Home shows the signed-in email + sign-out; dynamic parts stream inside `<Suspense>`
  (Cache Components requirement)
- Unit tests for the pure auth helpers (`isPublicPath`, `safeNextPath`, `normalizeEmail`)

Remaining (needs Christian's accounts):
1. Create a Supabase project (free). In the dashboard: Authentication → URL configuration →
   add the Vercel URL and `http://localhost:3000` plus `/auth/callback` redirect URLs.
2. `npx supabase login && npx supabase link --project-ref <ref> && npx supabase db push`
   to apply the migration (never edit the schema by hand).
3. Import the repo into Vercel; set `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production + Preview); confirm preview deploys on PRs.
4. Sign in on the phone via the emailed link, then Safari → Share → Add to Home Screen and
   confirm it opens full screen.
5. Supabase auth rate limits: free tier sends ~2 emails/hour with the built-in SMTP; fine for
   one user, but note it if sign-in emails seem slow.

## Next: M2 — quick capture

Text + photo capture from the home screen, saved to `entries` / `photos`. Christian starts logging.

## Blockers / needs from Christian

- Supabase + Vercel accounts (free) for the rest of M1. Anthropic API key by M3.
