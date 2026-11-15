import { localDay, localHour } from "@/lib/entries/time";
import { lastNightLine } from "@/lib/checkins";
import { showIntentionPrompt } from "@/lib/intention";
import { lastNightTomorrow } from "../checkin/last-night";
import { createClient } from "@/lib/supabase/server";
import { IntentionLine, type Intention } from "./intention-line";

export async function getTodayIntention(userId: string, timeZone: string): Promise<Intention | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("intentions")
    .select("id, text, done_at")
    .eq("owner_id", userId)
    .eq("day", localDay(new Date(), timeZone))
    .maybeSingle();
  return (data as Intention | null) ?? null;
}

/** Shows the line in the morning window, or all day once an intention is set. */
export async function TodayIntention({ userId, timeZone, hidePrompt = false }: { userId: string; timeZone: string; hidePrompt?: boolean }) {
  const [intention, lastNight] = await Promise.all([getTodayIntention(userId, timeZone), lastNightTomorrow(await createClient(), userId, timeZone)]);
  // Last night's "better tomorrow" sits here all day as a quiet marker (not while the card asks).
  const marker = lastNight && !hidePrompt ? <p className="text-[13px] font-semibold text-muted">{lastNightLine(lastNight)}</p> : null;
  if (!intention && hidePrompt) return null;
  if (!showIntentionPrompt(localHour(new Date(), timeZone), !!intention)) return marker;
  return (
    <>
      {marker}
      <IntentionLine intention={intention} />
    </>
  );
}
