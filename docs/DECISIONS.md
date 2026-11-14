# Decisions

Newest at the bottom. Each entry: what we decided, why, what we gave up.

### 2026-11-11 — Installable web app (PWA), not a native app
Why: on the iPhone home screen through Safari with no App Store review and instant updates.
iOS 16.4+ supports web push for home-screen web apps, which the check-ins need.
Gave up: rich notifications. iOS web notifications have no images or action buttons, so a
check-in reply opens a quick-reply screen.

### 2026-11-11 — Next.js on Vercel
Why: Vercel builds Next.js; every PR gets a preview URL testable on the phone; free Hobby tier.
Gave up: Vercel Hobby cron runs at most once a day (±59 min), so the check-in scheduler
can't live there (see the Supabase decision).

### 2026-11-11 — Supabase for database, auth, storage, scheduling
Why: one free service covering Postgres + RLS, magic-link auth, photo storage, migrations in
Git via the CLI, and pg_cron for frequent scheduling (random check-ins).
Gave up: free projects pause after 7 days without activity (daily use and the scheduler prevent
this); 500 MB database and 1 GB file storage, so photos are compressed client-side.
Alternatives considered: Firebase (weaker relational model and migrations), Neon + Clerk + S3
(more vendors to wire).

### 2026-11-11 — System font stack until the M3 design pass
Why: Google Fonts can't be reached from the build sandbox, and typography should be a deliberate
design choice anyway. M3 will pick fonts and ship them via `next/font/local`.

### 2026-11-11 — Claude API, server-side only, model in an env var
Why: keys never reach the client; the model can be swapped for cost or quality without code
changes (`ANTHROPIC_MODEL`).

### 2026-11-11 — Partner is openly an AI, not a therapist
Why: Christian's call. It must never pretend to be human. A small cute avatar is welcome. In a
crisis it points to real help rather than acting as care.

### 2026-11-11 — Schema shape for v1 (M1)
`profiles` holds check-in preferences (window, count, quiet hours by implication, timezone)
rather than a separate settings table. `entries` is the single scrapbook table: captures,
check-in replies and reflection outputs all land there with a `source` enum, so Today and
bucket views read one table. `check_ins`, `reflections` and `next_steps` are their own tables
because they have lifecycles (scheduled → sent → answered; proposed → accepted → done/skipped).
Gave up: a generic "events" table; too abstract for a one-user MVP.

### 2026-11-11 — Buckets are rows, not an enum
Users can rename and add buckets, so the three starters are seeded per user by the
`handle_new_user` trigger (`is_starter = true`). `src/lib/buckets.ts` keeps the defaults for the
UI and the seed in sync by convention; if they diverge, the DB wins.

### 2026-11-11 — Auth via Next proxy + `@supabase/ssr`, both magic-link flows supported
The proxy refreshes the session cookie on every request (required by `@supabase/ssr`) and does
the redirect-to-login check; pages verify with `getUser()` (server-validated), never the cookie
alone. Both `/auth/callback` (PKCE `?code=`) and `/auth/confirm` (`?token_hash=`) exist so the
default Supabase email template and a customised one both work. Only same-origin `next` paths
are honoured after login.

### 2026-11-11 — App builds and runs without Supabase env vars
`getSupabaseEnv()` returns null instead of throwing, the proxy passes requests through, and
`/login` shows an "unconfigured" note. Why: CI and `next build` must not need secrets, and a
fresh clone should render the shell. `getUser()` calls `connection()` first so the account
slot is always request-time, never prerendered as signed-out.

### 2026-11-11 — Deploy after M2, not before (Christian)
Why: nothing worth opening on a phone until capture exists; local `npm run dev` is enough to
iterate. Vercel + redirect URLs + Home Screen install move to right after M2.

### 2026-11-11 — Photos upload from the browser, not through a Server Function
Server Functions have a ~1 MB body limit by default and would double the transfer. The browser
compresses (canvas, ≤1600px, JPEG) and uploads directly to Supabase Storage with the user's own
session; storage RLS keys off the first path segment (`<user_id>/…`). The server action stores
only the path and re-checks that segment. Gave up: HEIC conversion on desktop browsers (falls
back to the original file; iPhone Safari hands over JPEG anyway).

### 2026-11-12 — Three panes (Capture · You · Reflect), bottom bar primary, swipe secondary
Christian's model: capture first, swipe to widgets, swipe again to insights. Claude pushed back
on swipe as the *primary* navigation: iOS edge-swipe conflicts in a PWA, swipe vs. vertical
scroll on long lists, no stable target for notification deep links, poor discoverability.
Agreed: bottom bar is primary, swipe stays if it behaves. Mental model unchanged.

### 2026-11-12 — Companion celebrates, never nags; prompts come after the moment
Christian wants an animated companion bouncing between panes (Duolingo-style warmth).
Guardrail from the no-guilt principle: it never droops or pressures; reminders are only the
configured check-ins, and they catch up with you after the fact rather than interrupting.

### 2026-11-12 — Collections in the user's words, not fixed buckets (Christian)
Christian: Goals/Taste/People felt imposed; the app should shape itself around the person and
be a base for recommendations. Agreed: emergent collections with a first-open picker of
suggestions (so no blank page), free-text additions any time, and partner-proposed collections
once the API is wired. Renamed `buckets` → `collections` everywhere now, before auto-sort and
recommendations build on the name (migration `20261112000000_collections.sql`; new users get no
preset rows; `profiles.setup_completed_at` gates the first-open screen). Gave up: a guaranteed
sort target for the AI; it will have to propose instead of assume.

### 2026-11-12 — First-open is a screen, not a chat (for now)
Talking to the partner to set things up is the goal, but it needs the API and prompt work.
A picker with suggestions + free text gets the same data today with zero AI risk. The screen is
the fallback even after chat exists.

### 2026-11-14 — Filing: confidence threshold, one proposal a night, Vercel Cron not pg_cron
The partner files only what it's ≥0.6 sure of and leaves the rest ("Filing tonight" stays
honest). It may start one collection a night, only from three or more unfiled things, and the
tile says so. Nightly run is Vercel Cron (Hobby allows daily, which is all filing needs);
pg_cron is still the plan for random check-ins (M4), which need sub-daily scheduling.
Model: Haiku 5.5 by default; filing is classification and cost matters more than nuance.
