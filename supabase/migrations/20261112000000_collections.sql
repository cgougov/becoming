-- Collections replace buckets (decided 2026-11-12): they're the user's own, in their words,
-- chosen on first open from suggestions or added freely; later proposed by the partner.

alter table public.buckets rename to collections;
alter table public.collections rename constraint buckets_pkey to collections_pkey;
alter table public.collections rename constraint buckets_owner_id_fkey to collections_owner_id_fkey;
alter table public.collections rename constraint buckets_owner_id_slug_key to collections_owner_id_slug_key;
alter index public.buckets_owner_idx rename to collections_owner_idx;
alter trigger buckets_set_updated_at on public.collections rename to collections_set_updated_at;
alter policy "buckets: owner all" on public.collections rename to "collections: owner all";

-- Where a collection came from. Useful once the partner starts proposing them.
create type public.collection_origin as enum ('suggested', 'user', 'partner');
alter table public.collections add column origin public.collection_origin not null default 'user';
update public.collections set origin = 'suggested' where is_starter;
alter table public.collections drop column is_starter;

alter table public.entries rename column bucket_id to collection_id;
alter table public.entries rename constraint entries_bucket_id_fkey to entries_collection_id_fkey;
alter index public.entries_bucket_idx rename to entries_collection_idx;

-- First-open setup: null until the user has chosen their collections.
alter table public.profiles add column setup_completed_at timestamptz;

-- New users no longer get preset collections; they choose on first open.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(coalesce(new.email, ''), '@', 1));
  return new;
end;
$$;
