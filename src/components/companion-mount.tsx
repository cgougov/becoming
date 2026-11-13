import { arrivalMood, daysBetween } from "@/lib/companion";
import { createClient, getUser } from "@/lib/supabase/server";
import { Companion } from "./companion";

/** Server side: reads your rhythm once per page load and hands the companion a mood. */
export async function CompanionMount() {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("entries")
    .select("captured_at")
    .eq("owner_id", user.id)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const days = data ? daysBetween(new Date(), new Date(data.captured_at as string)) : null;
  return <Companion mood={arrivalMood(days)} />;
}
