# Becoming — working rules for Claude

Becoming is a phone-first web app (installable PWA): **a running partner for your life**.
You capture things in seconds (text, photos), it sorts them into buckets (Goals, Taste, People),
checks in with you at random moments, and after a week of logging helps you reflect and choose
a small next step. Single user (Christian) for v1. The social layer comes later.

Read these before doing anything:
1. `docs/PRODUCT.md`: vision, v1 scope, the partner's character rules, what is out of scope
2. `docs/STATUS.md`: where the build is and what's next
3. `docs/DECISIONS.md`: decisions already made and why (don't re-litigate without a reason)
4. `AGENTS.md`: Next.js 16 note. This Next version differs from training data; read
   `node_modules/next/dist/docs/` before using an API you're unsure of.

## How we work (non-negotiable)

- **Before starting:** run `git status` and `git branch --show-current`. Don't build on top of
  uncommitted changes you don't understand. Pull `main` first.
- **One milestone (or sub-step) per feature branch:** `feat/m2-capture`, `fix/...`, `docs/...`.
  Never commit directly to `main`.
- **Small, testable steps.** Each step leaves the app building and the checks green.
- **At each completed step:**
  1. `npm run check` (lint + typecheck + tests + build). All must pass.
  2. Update `docs/STATUS.md` (what's done, what's next, any blockers).
  3. Add to `docs/DECISIONS.md` if you made a non-obvious choice.
  4. Commit with a clear message, push, and open a PR into `main`.
- **Tests:** Vitest + Testing Library, colocated as `*.test.ts(x)`. Pure logic (sorting rules,
  scheduling, prompt building) must have unit tests.
- **Database:** every schema change is a migration in `supabase/migrations/` committed to Git.
  Never change the database by hand in the dashboard. Row Level Security on every table.
- **Secrets:** never commit them. Document every env var in `.env.example`.
- **Ask Christian before:** adding a paid service, changing the stack, or anything that touches
  his real data destructively.

## Environment notes (Claude Code cloud sessions)

- GitHub GraphQL is blocked, so `gh pr create` fails. Open PRs with the REST API:
  `gh api repos/cgougov/becoming/pulls -f title=... -f head=<branch> -f base=main -f body=...`
- Google Fonts are unreachable from the sandbox, so `next/font/google` breaks local builds.
  Use `next/font/local` with font files committed to the repo.

## Stack

Next.js 16 (App Router, TypeScript, Tailwind v4) · Supabase (Postgres, Auth, Storage, pg_cron) ·
Vercel (hosting, preview deploy per PR) · Claude API (server-side only, model set via env var).

## Product guardrails (from PRODUCT.md, the short version)

- Capture must take seconds. Never add required fields to capture.
- No streaks, no guilt. Missing a day never erases anything.
- The partner is openly an AI. It never pretends to be human, a friend, or a therapist.
- Success = life off the phone, not time in the app.
