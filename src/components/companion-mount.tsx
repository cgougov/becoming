import { pipMoodFor } from "@/lib/checkins";
import { arrivalMood, daysBetween } from "@/lib/companion";
import { localDay } from "@/lib/entries/time";
import { createClient, getUser } from "@/lib/supabase/server";
import { Companion } from "./companion";

/** Server side: reads your rhythm once per page load and tells Pip how you're arriving. */
export async function CompanionMount() {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const [{ data }, { data: profile }] = await Promise.all([
    supabase.from("entries").select("captured_at").eq("owner_id", user.id).order("captured_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle(),
  ]);
  const days = data ? daysBetween(new Date(), new Date(data.captured_at as string)) : null;
  const m = arrivalMood(days);
  const day = localDay(new Date(), profile?.timezone ?? "America/New_York");
  // Today's latest check-in sets how Pip rests.
  const { data: checks } = await supabase
    .from("day_checks")
    .select("kind, mood, energy")
    .eq("owner_id", user.id)
    .eq("day", day)
    .eq("skipped", false)
    .not("mood", "is", null);
  const check = (checks ?? []).find((c) => c.kind === "evening") ?? (checks ?? [])[0];
  const checked = check ? pipMoodFor(check.mood as number, (check.energy as number) ?? 50) : null;
  return <Companion arrival={m === "fresh" ? "fresh" : m === "curious" ? "back" : "normal"} day={day} checked={checked} />;
}
