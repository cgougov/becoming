-- Morning intention: one line for the day, pinned on Keep (PRODUCT.md "Intentionality" #2).
create table public.intentions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,                 -- the user's local day
  text text not null,
  done_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, day)
);

create index intentions_owner_day_idx on public.intentions (owner_id, day desc);

create trigger intentions_set_updated_at
  before update on public.intentions
  for each row execute function public.set_updated_at();

alter table public.intentions enable row level security;

create policy "intentions: owner all" on public.intentions
  for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
