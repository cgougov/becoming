# Becoming

A running partner for your life. Capture what matters in seconds (thoughts, photos, goals, people),
get gentle check-ins, and reflect weekly on who you're becoming.

Private MVP. See [`docs/PRODUCT.md`](docs/PRODUCT.md) for scope and [`docs/STATUS.md`](docs/STATUS.md)
for progress.

## Develop

Requires Node 22+.

```bash
npm install
cp .env.example .env.local   # Supabase URL + anon key; without them the app renders unauthenticated
npm run dev                  # http://localhost:3000
npm run check                # lint + typecheck + tests + build
```

## Database

Schema lives in `supabase/migrations/` and is applied with the Supabase CLI; never edit it in the dashboard.

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push --remote   # --remote targets the linked project, not local Docker
```

## Install on iPhone

Open the deployed URL in **Safari** → Share → **Add to Home Screen**. Check-in notifications only
work from the home-screen app.
