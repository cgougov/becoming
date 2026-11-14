-- Push notifications (M4 part 2): the daily moment, the morning check-in, the 10pm wind-down.

-- One row per device that said yes to notifications.
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index push_subscriptions_owner_idx on public.push_subscriptions (owner_id);
alter table public.push_subscriptions enable row level security;
create policy "push_subscriptions: owner all" on public.push_subscriptions
  for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

-- What was sent, so a tick never sends the same nudge twice in a day.
create table public.push_sent (
  owner_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  kind text not null check (kind in ('morning', 'evening', 'moment')),
  sent_at timestamptz not null default now(),
  primary key (owner_id, day, kind)
);
alter table public.push_sent enable row level security;
create policy "push_sent: owner read" on public.push_sent
  for select using ((select auth.uid()) = owner_id);

-- The scheduler: every 5 minutes, Postgres pings /api/push/tick (Vercel Hobby cron is daily-only).
-- The bearer secret lives in Supabase Vault as 'push_tick_secret' (added once by hand; never in Git).
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'becoming-push-tick',
  '*/5 * * * *',
  $$
  select net.http_get(
    url := 'https://becoming-lilac.vercel.app/api/push/tick',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || coalesce((select decrypted_secret from vault.decrypted_secrets where name = 'push_tick_secret'), '')
    ),
    timeout_milliseconds := 20000
  );
  $$
);
