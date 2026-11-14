-- Goals, alive: Pip links what you keep to the directions it moves you toward, so a direction
-- can say "3 things this week". A view of your days, like collections and people.
create table public.direction_links (
  owner_id uuid not null references public.profiles (id) on delete cascade,
  entry_id uuid not null references public.entries (id) on delete cascade,
  direction_id uuid not null references public.directions (id) on delete cascade,
  source text not null default 'ai' check (source in ('ai', 'user')),
  created_at timestamptz not null default now(),
  primary key (entry_id, direction_id)
);
create index direction_links_direction_idx on public.direction_links (owner_id, direction_id);
alter table public.direction_links enable row level security;
create policy "direction_links: owner all" on public.direction_links
  for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
