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
