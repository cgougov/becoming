-- Yours, rebuilt (PRODUCT.md "Decisions 2026-11-14"): directions with horizons and optional
-- photos, your own cover photos on collections. People already have close / note / photo_path.

create type public.direction_horizon as enum ('week', 'month', 'year');

create table public.directions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  text text not null check (char_length(text) between 1 and 120),
  horizon public.direction_horizon not null default 'month',
  photo_path text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index directions_owner_idx on public.directions (owner_id, created_at desc) where archived_at is null;
create trigger directions_set_updated_at before update on public.directions
  for each row execute function public.set_updated_at();
alter table public.directions enable row level security;
create policy "directions: owner all" on public.directions
  for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

alter table public.collections add column cover_path text;
