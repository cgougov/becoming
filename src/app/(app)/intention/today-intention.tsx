import { localDay, localHour } from "@/lib/entries/time";
import { showIntentionPrompt } from "@/lib/intention";
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
export async function TodayIntention({ userId, timeZone }: { userId: string; timeZone: string }) {
  const intention = await getTodayIntention(userId, timeZone);
  if (!showIntentionPrompt(localHour(new Date(), timeZone), !!intention)) return null;
  return <IntentionLine intention={intention} />;
}
