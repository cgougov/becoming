# Status

_Last updated: 2026-11-11 (M0)_

## Current milestone: M0 — repo scaffold ✅ (in PR)

Done:
- Next.js 16 app (App Router, TypeScript, Tailwind v4) with a placeholder home showing the
  three starter buckets
- PWA basics: web manifest, placeholder icons (192/512/maskable/apple-touch), iOS web-app metadata
- Checks: `npm run check` = ESLint + `tsc` + Vitest + `next build`, all passing
- CI: GitHub Actions runs the same checks on every PR and on `main`
- Docs: `CLAUDE.md`, `docs/PRODUCT.md`, `docs/STATUS.md`, `docs/DECISIONS.md`, `.env.example`

## Next: M1 — data, login, deploy

1. Create a Supabase project (Christian, free tier) and link it with the Supabase CLI
2. Migrations: `profiles`, `buckets`, `entries` (text + optional photo), `check_ins`,
   `reflections`, `next_steps`; RLS so every row is owner-only; private `photos` storage bucket
3. Magic-link email login (single user, but real auth because the app is on the public internet)
4. Connect the repo to Vercel; set env vars; confirm preview deploys on PRs
5. Install on iPhone (Safari → Share → Add to Home Screen) and confirm it opens full screen

## Blockers / needs from Christian

- Accounts for M1: Supabase, Vercel (both free). Anthropic API key needed by M3.
