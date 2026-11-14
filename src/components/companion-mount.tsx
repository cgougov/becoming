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
  return <Companion arrival={m === "fresh" ? "fresh" : m === "curious" ? "back" : "normal"} day={day} />;
}
