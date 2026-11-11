-- Becoming — initial schema (M1)
-- Single user in v1, but every table is owner-scoped with RLS from day one.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user. Check-in preferences live here.
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  timezone text not null default 'America/New_York',
  -- check-in window and quiet hours (local time, minutes after midnight)
  checkin_window_start int not null default 600  check (checkin_window_start between 0 and 1439), -- 10:00
  checkin_window_end   int not null default 1260 check (checkin_window_end   between 0 and 1439), -- 21:00
  checkins_per_day     int not null default 2    check (checkins_per_day between 0 and 5),
  morning_checkin      boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- buckets: Goals / Taste / People to start; user can rename and add.
-- ---------------------------------------------------------------------------

create table public.buckets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  position int not null default 0,
  is_starter boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create index buckets_owner_idx on public.buckets (owner_id, position);

create trigger buckets_set_updated_at
  before update on public.buckets
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- entries: the scrapbook. Text and/or photo. Nothing required beyond owner.
-- ---------------------------------------------------------------------------

create type public.entry_source as enum ('capture', 'check_in', 'reflection');

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  bucket_id uuid references public.buckets (id) on delete set null,
  body text,
  photo_path text,                       -- object path in the private "photos" storage bucket
  source public.entry_source not null default 'capture',
  sorted_by text,                        -- 'ai' | 'user' | null (unsorted)
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (body is not null or photo_path is not null)
);

create index entries_owner_captured_idx on public.entries (owner_id, captured_at desc);
create index entries_bucket_idx on public.entries (bucket_id);

create trigger entries_set_updated_at
  before update on public.entries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- check_ins: scheduled prompts. A reply becomes an entry (source = check_in).
-- ---------------------------------------------------------------------------

create type public.check_in_kind as enum ('morning', 'random');
create type public.check_in_status as enum ('scheduled', 'sent', 'answered', 'skipped');

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  kind public.check_in_kind not null,
  prompt text not null,
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status public.check_in_status not null default 'scheduled',
  reply_entry_id uuid references public.entries (id) on delete set null,
  created_at timestamptz not null default now()
);

create index check_ins_owner_sched_idx on public.check_ins (owner_id, scheduled_for desc);
create index check_ins_due_idx on public.check_ins (scheduled_for) where status = 'scheduled';

-- ---------------------------------------------------------------------------
-- reflections: a short, capped back-and-forth. Ends with a next step or insight.
-- ---------------------------------------------------------------------------

create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  opening_question text not null,
  transcript jsonb not null default '[]'::jsonb,   -- [{role:'partner'|'you', text, at}]
  insight text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reflections_owner_idx on public.reflections (owner_id, created_at desc);

create trigger reflections_set_updated_at
  before update on public.reflections
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- next_steps: the one thing pinned to Today. Skip is information, not failure.
-- ---------------------------------------------------------------------------

create type public.next_step_status as enum ('proposed', 'accepted', 'done', 'skipped');

create table public.next_steps (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  reflection_id uuid references public.reflections (id) on delete set null,
  text text not null,
  status public.next_step_status not null default 'proposed',
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index next_steps_owner_idx on public.next_steps (owner_id, created_at desc);

create trigger next_steps_set_updated_at
  before update on public.next_steps
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: owner-only on everything.
-- ---------------------------------------------------------------------------

alter table public.profiles    enable row level security;
alter table public.buckets     enable row level security;
alter table public.entries     enable row level security;
alter table public.check_ins   enable row level security;
alter table public.reflections enable row level security;
alter table public.next_steps  enable row level security;

create policy "profiles: owner read"   on public.profiles for select using ((select auth.uid()) = id);
create policy "profiles: owner update" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "buckets: owner all" on public.buckets
  for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy "entries: owner all" on public.entries
  for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy "check_ins: owner all" on public.check_ins
  for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy "reflections: owner all" on public.reflections
  for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy "next_steps: owner all" on public.next_steps
  for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

-- ---------------------------------------------------------------------------
-- New user → profile + starter buckets. Runs as definer because auth.users
-- inserts happen outside any user session.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(coalesce(new.email, ''), '@', 1));

  insert into public.buckets (owner_id, slug, name, description, position, is_starter) values
    (new.id, 'goals',  'Goals',  'What you''re working toward and how it''s going.',          0, true),
    (new.id, 'taste',  'Taste',  'Culture and art that moves you.',                           1, true),
    (new.id, 'people', 'People', 'The people in your life and how you stay close to them.',  2, true);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Storage: private "photos" bucket, objects stored under <owner_id>/...
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

create policy "photos: owner read" on storage.objects for select
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "photos: owner insert" on storage.objects for insert
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "photos: owner update" on storage.objects for update
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "photos: owner delete" on storage.objects for delete
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
