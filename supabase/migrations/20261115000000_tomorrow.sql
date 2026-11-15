-- The wind-down asks "one thing to do better tomorrow?"; the answer comes back next morning
-- (on Today and in the 8:30 notification). Stored on that evening's check.
alter table public.day_checks add column if not exists tomorrow text
  check (tomorrow is null or char_length(tomorrow) <= 120);
