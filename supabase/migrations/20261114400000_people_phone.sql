-- A person's number, so their page can text / call / FaceTime them in one tap.
alter table public.people add column if not exists phone text
  check (phone is null or phone ~ '^\+?[0-9]{3,20}$');
