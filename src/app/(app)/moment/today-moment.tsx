import { localDay } from "@/lib/entries/time";
import { momentPhase, pickMomentTime, type MomentPhase } from "@/lib/moment";
import { createClient } from "@/lib/supabase/server";

export interface Moment {
  id: string;
  at: string;
  status: "scheduled" | "kept" | "missed";
}

/** Today's moment, created lazily on first open of the day. */
export async function ensureTodayMoment(userId: string, timeZone: string): Promise<Moment | null> {
  const supabase = await createClient();
  const now = new Date();
  const day = localDay(now, timeZone);
  const { data: existing } = await supabase.from("moments").select("id, at, status").eq("owner_id", userId).eq("day", day).maybeSingle();
  if (existing) return existing as Moment;

  const { data: profile } = await supabase
    .from("profiles")
    .select("checkin_window_start, checkin_window_end")
    .eq("id", userId)
    .maybeSingle();
  const at = pickMomentTime(now, timeZone, profile?.checkin_window_start ?? 600, profile?.checkin_window_end ?? 1260);
  const { data: created } = await supabase
    .from("moments")
    .upsert({ owner_id: userId, day, at: at.toISOString() }, { onConflict: "owner_id,day", ignoreDuplicates: true })
    .select("id, at, status")
    .maybeSingle();
  if (created) return created as Moment;
  const { data: again } = await supabase.from("moments").select("id, at, status").eq("owner_id", userId).eq("day", day).maybeSingle();
  return (again as Moment | null) ?? null;
}

export function phaseOf(m: Moment, now = new Date()): MomentPhase {
  return momentPhase(now, new Date(m.at));
}
