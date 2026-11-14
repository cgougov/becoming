-- The daily moment (PRODUCT.md "Intentionality" #1): one random time a day inside the
-- user's window. Missing it changes nothing; the row just records what happened.
create type public.moment_status as enum ('scheduled', 'kept', 'missed');

create table public.moments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,                     -- the user's local day
  at timestamptz not null,               -- when the moment is
  status public.moment_status not null default 'scheduled',
  entry_id uuid references public.entries (id) on delete set null,
  notified_at timestamptz,               -- set by push (M4 part 2)
  created_at timestamptz not null default now(),
  unique (owner_id, day)
);

create index moments_due_idx on public.moments (at) where status = 'scheduled';

alter table public.moments enable row level security;
create policy "moments: owner all" on public.moments
  for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
