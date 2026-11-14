# Status

_Last updated: 2026-11-14 (M4 part 1: daily moment)_

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

## M3 step 4 — rhythm: intention, week dots, companion moods, glass bar ✅ (PR #11, on #10)

PRODUCT.md "Intentionality" items 2, 3, 4:
- **Morning intention** (`intentions` table, migration `20261113000000`): on Keep, a one-line
  input between 05:00 and 11:00 local; once set it's pinned all day with a check and a clear.
  Shows in the Today chip on Yours too. Rules in `src/lib/intention.ts` (tested).
  **Christian: `npx supabase db push --remote` after pulling.**
- **Week dots** on Yours: Mon–Sun, filled on days you kept something, today ringed, no counter.
- **Companion moods** (`src/lib/companion.ts`): `fresh` (never kept: says "hi." once),
  `curious` (3+ quiet days: quicker bob, wider eyes, says nothing), `idle`. Read server-side
  in `CompanionMount`.
- **Glass bar**: translucent, blurred, saturated. First try at the "glass" note.
- `docs/PRODUCT.md`: identity + references section; "the partner gives"; BEHAVIOR.md planned.

## M3 step 5 — today's page: edit in place ✅ (PR #12, on #11)

- Kept things render as lines on a page (dividers, no cards). Tap text to edit in place;
  blur/⌘↩ saves, Esc cancels; emptying a text-only line removes it; photos get captions.
  `updateEntryBody` action. Status reads the collection name or "Filing tonight".
- "Not filed yet" is gone everywhere; `/you/unsorted` is titled "Filing tonight".
- PRODUCT.md: "Notes-app feel, item structure".

## M3 step 6 — craft pass (Claude's design turn) ✅ (PR #14)

- Palette: pure white / near-black; dark follows the phone (`prefers-color-scheme`); the
  companion is the one accent; the Keep button is ink, not accent.
- Photos full-bleed on Keep (edge to edge, up to 70vh); collection tiles get a cover from their
  latest photo with a dark gradient for the name.
- Pressed states on everything tappable; panes animate in; tap highlight removed.
- Subtraction: week dots moved to Look back; the intention line collapses to
  "+ one thing for today" until tapped; bigger capture type.
- Days close: only today's lines are editable (annotations come with the partner).

## M3 step 7 — the partner's first job: filing ✅ (PR #15)

- `src/lib/partner/`: `character.ts` (system prompt, one place), `client.ts` (the only module
  that knows the model; `ANTHROPIC_MODEL`, default `claude-haiku-5-5`), `filing.ts` (prompt +
  JSON schema + result cleaning, unit-tested), `run-filing.ts` (applies confident assignments
  ≥0.6, creates at most one partner-proposed collection a night from ≥3 entries, `origin=partner`).
- Structured output via `output_config.format` (json_schema); no beta header.
- `/api/partner/file`: nightly job for all users, Vercel Cron at 04:00 UTC (`vercel.json`),
  guarded by `CRON_SECRET`, uses the service-role key. "File now" button on Keep runs it for
  the signed-in user under RLS.
- Tiles show "started by your partner" for partner-origin collections.
- Env needed: `ANTHROPIC_API_KEY` (local + Vercel), `ANTHROPIC_MODEL` (optional), `CRON_SECRET`
  + `SUPABASE_SERVICE_ROLE_KEY` (Vercel only, for the cron). Documented in `.env.example`.

## M4 part 1 — the daily moment, in-app ✅ (PR #16)

- `moments` table (migration `20261114000000`): one row per local day, a random time inside
  the profile's window (default 10:00–21:00), status scheduled/kept/missed, `entry_id`.
  **Christian: `npx supabase db push --remote`.**
- Created lazily on first open of the day (`ensureTodayMoment`); never earlier than now+15m.
- Keep: upcoming → "today's moment · 4:12pm" (muted); live (90 min) → accent card with the
  companion's ask ("what's right now?") + a line of encouragement, capture placeholder becomes
  "right now…"; keeping during it marks the moment kept and the companion says so. Passed →
  silence, by design (no "missed" copy anywhere).
- Voice lines in `src/lib/moment.ts` and `src/lib/companion.ts`.
- Look back: the "From your partner · an AI" label is gone; the companion's face instead.

## Voice + black ✅ (PR #17, on #16)

- Pip rewritten as a kawaii C-3PO everywhere (`src/lib/companion.ts`, `src/lib/moment.ts`,
  `src/lib/partner/character.ts`); `docs/VOICE.md`; `src/lib/voice.test.ts` fails the build on
  banned patterns (em dashes, "journey", contrast-reveals, therapy-speak, emoji, length).
- Black by default (`color-scheme: dark`, theme/manifest colors).

## Pip, round 7 in code ✅ (PR #20)

- `src/lib/pip.ts`: four face families (mochi, bean, smiley, kitty) as data, rotating by local
  day; soft = Bean's soft face always; `MOOD_COLORS` (calm coral, happy yellow, sleepy lilac,
  soft blue); `restingMood` (sleepy 00–05, happy on return). Tested.
- `PipFace` renders it; the body color fades between moods; faces swap with a bounce.
- `Companion`: hops on return (then settles), spins + speaks on keep, `HARD_EVENT` → soft blue,
  sways, "oh no. I'm sorry." (fired by tagging in the next PR), giggles when tapped.
- Pip's face replaces the plain accent dots on Look back and the moment card.

## Next (positioning 2026-11-14, see PRODUCT.md "Positioning")

1. Today's page with live tags. 2. People pages + nudges. 3. 10pm wind-down. 4. Yours as the scrapbook of you. 5. Sunday letter. 6. Zero-friction onboarding. Then ten real people.

### Superseded order

1. Mock the 10pm wind-down (sliders + Pip's live face + one good thing) → build it.
2. Today's page with live tags (replaces filing UI).
3. Pip's one suggestion on open; Pip states (hop on return, spin, mirror, doze).
4. People pages; directions; the weekly letter; resurfacing.
5. M4 part 2: push for the moment and the wind-down (needs the phone install).

### Earlier
1. **Deploy** (Christian) → then **M4 part 2: push** (service worker, VAPID, a cron that sends
   the moment's tap; `notified_at`).
2. **People as first-class** (relationships second brain).
3. Pip in code: spin, expressions, "I'm sorry" for hard things.
4. Lenses + the Sunday question.

### Earlier

1. **Deploy** (Christian: Vercel import + env vars; Supabase redirect URLs) → iPhone Home Screen.
2. `docs/BEHAVIOR.md`: evidence-backed principles mapped to the app (Claude drafts, Christian reviews).
2. Deploy + Home Screen install, then **the daily moment** (M4 web push + pg_cron).
3. **Partner, first contact** (Anthropic key): auto-file, propose collections, lenses, "the partner gives".
4. Companion character pass.

### Earlier

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
