-- Day is home; the partner tags as you keep (PRODUCT.md "Decisions 2026-11-14").
-- A kept thing can carry several tags: collections and people. Collections and people are
-- views of your days, never folders. entries.collection_id stays for now (deprecated).

create table public.people (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null,
  name text not null,
  close boolean not null default false,          -- your close circle (people pages, next PR)
  note text,
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);
create trigger people_set_updated_at before update on public.people
  for each row execute function public.set_updated_at();
alter table public.people enable row level security;
create policy "people: owner all" on public.people
  for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create type public.tag_kind as enum ('collection', 'person');

create table public.entry_tags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  entry_id uuid not null references public.entries (id) on delete cascade,
  kind public.tag_kind not null,
  collection_id uuid references public.collections (id) on delete cascade,
  person_id uuid references public.people (id) on delete cascade,
  source text not null default 'ai' check (source in ('ai', 'user')),
  created_at timestamptz not null default now(),
  check (
    (kind = 'collection' and collection_id is not null and person_id is null)
    or (kind = 'person' and person_id is not null and collection_id is null)
  )
);
create unique index entry_tags_unique on public.entry_tags (entry_id, coalesce(collection_id, person_id));
create index entry_tags_entry_idx on public.entry_tags (entry_id);
create index entry_tags_collection_idx on public.entry_tags (owner_id, collection_id) where collection_id is not null;
create index entry_tags_person_idx on public.entry_tags (owner_id, person_id) where person_id is not null;
alter table public.entry_tags enable row level security;
create policy "entry_tags: owner all" on public.entry_tags
  for all using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

-- When the partner has read an entry, and how it read (Pip goes soft on 'hard').
alter table public.entries
  add column tagged_at timestamptz,
  add column tone text check (tone in ('hard', 'neutral', 'good'));

-- Carry existing filing over as collection tags.
insert into public.entry_tags (owner_id, entry_id, kind, collection_id, source)
select owner_id, id, 'collection', collection_id, case when sorted_by = 'user' then 'user' else 'ai' end
from public.entries
where collection_id is not null
on conflict do nothing;

update public.entries set tagged_at = updated_at where collection_id is not null and tagged_at is null;
