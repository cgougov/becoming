# Status

_Last updated: 2026-11-12 (M3 design: Keep)_

## Done

- **M0** — repo scaffold: Next.js 16 app, PWA basics, `npm run check`, CI, docs. Merged (#1).

## M1 — data + login ✅ (PR #2) · deploy deferred to after M2

Supabase project created and migration applied with `supabase db push --remote` (2026-11-11).
`.env.local` exists on Christian's Mac; the app runs locally with `npm run dev`.

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
1. On the Mac, from the repo: `npx supabase login && npx supabase link --project-ref rwajpzussyvjgezvwkly && npx supabase db push --remote`
   to apply the migration (never edit the schema by hand).
2. Dashboard → Authentication → URL Configuration: add `http://localhost:3000/**` and, once
   Vercel exists, `https://<app>.vercel.app/**` to redirect URLs; set Site URL to the Vercel URL.
3. Import the repo into Vercel; set the two env vars above (Production + Preview); confirm
   preview deploys on PRs.
4. Sign in on the phone via the emailed link, then Safari → Share → Add to Home Screen and
   confirm it opens full screen.
5. Supabase auth rate limits: free tier sends ~2 emails/hour with the built-in SMTP; fine for
   one user, but note it if sign-in emails seem slow.

## M2 — quick capture ✅ (PR #3, built on top of #2)

- Capture box on home: text and/or photo, nothing required. ⌘/Ctrl+Enter saves.
- Photos are compressed in the browser (≤1600px JPEG) and uploaded straight to the private
  `photos` bucket under `<user_id>/<yyyy-mm>/<uuid>.jpg`; the server action only stores the path
  and checks the path's owner segment matches the user.
- Today list: today's entries in the profile's timezone, newest first, signed photo URLs
  (1 h), remove button (also deletes the storage object).
- Bucket cards show per-bucket counts; entries are unsorted until M3 auto-sort.
- Unit tests: day boundaries across DST, photo path construction.

## M3 step 1 — app shell ✅ (PR #6)

Decided with Christian 2026-11-12 (see PRODUCT.md "Three panes" and DECISIONS):
- Route group `src/app/(app)/` with a shared layout: bottom bar (Capture · You · Reflect),
  swipe-between-panes as a bonus (edge-safe, horizontal-only; `src/lib/panes.ts` is unit-tested),
  and a reserved `CompanionSlot` so the layout won't shift when the character arrives.
- **Capture** `/`: box + today's log.
- **You** `/you`: Today widget + bucket cards; `/you/<slug>` opens the bucket's scrapbook,
  `/you/unsorted` shows unfiled entries. Sign-out lives at the bottom of this pane.
- **Reflect** `/reflect`: "this week so far" (captures, photos, days; up to 4 recent photos)
  and an openly-AI note on when reflection unlocks.
- Cache Components: anything reading `cookies()`, `params` or `usePathname()` sits in `<Suspense>`.

## M3 step 2 — collections in your words ✅ (PR #7, stacked on #6)

- Migration renames `buckets` → `collections`, adds `origin` (suggested/user/partner) and
  `profiles.setup_completed_at`; new users no longer get preset collections.
  **Christian must run `npx supabase db push --remote` after pulling.** His existing three
  rows survive; he'll be sent through `/start` once (duplicates are ignored).
- `/start`: "What do you want to keep track of?" with 12 tappable suggestions + free text;
  "start with nothing" allowed. `requireUser()` in `src/lib/session.ts` gates every pane.
- You pane: "Keep track of something new…" input. Unsorted link reads "not filed yet".
- Pure logic in `src/lib/collections.ts` with tests (slugify, name rules, initial rows).

## M3 step 3 — design pass, round 4 language in code ✅ (PR #10)

Four mockup rounds on the Design canvas ("Becoming — design directions"); decisions in
PRODUCT.md. Built:
- Theme: warm white / charcoal / one accent (`globals.css` tokens; Plus Jakarta Sans via
  `@fontsource-variable`, no Google Fonts at build). Dark theme follows the phone later.
- **Keep**: big text box as the hero, photo button, accent Keep pill; "Kept today" as white
  cards with a collection dot. Pane names are now Keep · Yours · Look back (icons only in the
  bar, accent dot under the active one).
- **Companion** (`src/components/companion.tsx`): accent circle that bobs and blinks; on a
  successful keep the form fires `becoming:kept` and it wiggles + pops a one-word reaction.
  Reduced-motion respected. Character pass still to do.
- Yours tiles (white, dot, count, latest line), Today chip, Look back tiles, start + login
  restyled to match.
- `dotColor(slug)` is a stable hash until collections get a `color` column.

## Next

1. **Christian uses it for a few days.** Then: companion character pass (circle, cute, simple),
   and the lenses concept for Look back (needs the API).
2. **Partner, first contact** (Anthropic key): auto-file captures, propose collections, lenses.
3. Deploy + Home Screen install once it feels right on the phone.

### Earlier

1. **Christian tries #6 + #7 locally** (pull, `db push --remote`, `npm run dev`), decides
   whether swipe stays, and tells us the words he'd use for the panes.
2. **M3 step 3 — design pass.** Typography, color, spacing, the companion's look. This is
   where UI quality gets decided; do it as a conversation, with mockups, before code.
3. **M3 step 4 — the partner, first contact:** auto-file captures into collections and propose
   new ones (first Claude API use; needs the key). Then talk-to-it setup.
4. Deploy (Vercel + redirect URLs + Home Screen install) once the shell feels right.

### Earlier notes

1. **Christian tries it locally** (`git pull`, `npm run dev`) and logs a few real things.
   Decision from Christian: get something functioning first, deploy after.
2. Deploy (the deferred M1 items): Vercel import + the two env vars, Supabase redirect URLs,
   install on iPhone. Needed before check-ins (M4) can mean anything.
3. **M3** — design pass (widget home, Today, avatar), then AI auto-sort into buckets.

## Blockers / needs from Christian

- Supabase + Vercel accounts (free) for the rest of M1. Anthropic API key by M3.
