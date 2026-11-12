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

Supabase project (created 2026-11-11, free tier). These two values are public by design:

```
NEXT_PUBLIC_SUPABASE_URL=https://rwajpzussyvjgezvwkly.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_EC4q6STXYgve31zaRk1G_w_u2XdEX8_
```
(project ref `rwajpzussyvjgezvwkly`; the publishable key is the new-style anon key.)
The Supabase API is not reachable from Claude Code cloud sessions, so `db push` runs on Christian's Mac.

Remaining:
1. On the Mac, from the repo: `npx supabase login && npx supabase link --project-ref rwajpzussyvjgezvwkly && npx supabase db push`
   to apply the migration (never edit the schema by hand).
2. Dashboard → Authentication → URL Configuration: add `http://localhost:3000/**` and, once
   Vercel exists, `https://<app>.vercel.app/**` to redirect URLs; set Site URL to the Vercel URL.
3. Import the repo into Vercel; set the two env vars above (Production + Preview); confirm
   preview deploys on PRs.
4. Sign in on the phone via the emailed link, then Safari → Share → Add to Home Screen and
   confirm it opens full screen.
5. Supabase auth rate limits: free tier sends ~2 emails/hour with the built-in SMTP; fine for
   one user, but note it if sign-in emails seem slow.

## Next: M2 — quick capture

Text + photo capture from the home screen, saved to `entries` / `photos`. Christian starts logging.

## Blockers / needs from Christian

- Supabase + Vercel accounts (free) for the rest of M1. Anthropic API key by M3.
