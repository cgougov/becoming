import type { SupabaseClient } from "@supabase/supabase-js";
import { localDay, startOfDayInTimeZone } from "@/lib/entries/time";

/** Yesterday's local date, for reading last night's wind-down. */
export function yesterday(now: Date, timeZone: string): string {
  return localDay(new Date(startOfDayInTimeZone(now, timeZone).getTime() - 1), timeZone);
}

/** Last night's "one thing to do better tomorrow", or null (also null before the migration). */
export async function lastNightTomorrow(supabase: SupabaseClient, userId: string, timeZone: string, now = new Date()): Promise<string | null> {
  const { data, error } = await supabase
    .from("day_checks")
    .select("tomorrow")
    .eq("owner_id", userId)
    .eq("kind", "evening")
    .eq("day", yesterday(now, timeZone))
    .maybeSingle();
  if (error) return null;
  return ((data as { tomorrow?: string | null } | null)?.tomorrow ?? null) || null;
}
