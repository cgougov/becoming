import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";

export interface Session {
  user: NonNullable<Awaited<ReturnType<typeof getUser>>>;
  timeZone: string;
  setupDone: boolean;
}

/**
 * The signed-in user plus the profile bits every pane needs. Returns null when
 * signed out (the proxy will have redirected; this covers the brief gap).
 * With `gate` (default), a user who hasn't finished first-open setup goes to /start.
 */
export async function requireUser(opts: { gate?: boolean } = {}): Promise<Session | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("timezone, setup_completed_at").eq("id", user.id).maybeSingle();
  const setupDone = !!data?.setup_completed_at;
  if ((opts.gate ?? true) && data && !setupDone) redirect("/start");
  return { user, timeZone: data?.timezone ?? "America/New_York", setupDone };
}
