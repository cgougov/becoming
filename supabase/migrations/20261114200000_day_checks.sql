-- Morning check-in and the 10pm wind-down (PRODUCT.md "Decisions 2026-11-14").
-- Mood and energy are private and never shown as a score; they feed gentle patterns later.
create type public.day_check_kind as enum ('morning', 'evening');

create table public.day_checks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,                        -- the user's local day
  kind public.day_check_kind not null,
  mood smallint check (mood between 0 and 100),
  energy smallint check (energy between 0 and 100),
  skipped boolean not null default false,   -- "not now": hides it for the day, nothing else
  entry_id uuid references public.entries (id) on delete set null,  -- the good thing, if kept
  created_at timestamptz not null default now(),
  unique (owner_id, day, kind)
);

alter table public.day_checks enable row level security;
create policy "day_checks: owner all" on public.day_checks
  for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
