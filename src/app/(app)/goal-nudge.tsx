import { GOAL_NUDGE_LINES, goalNudge } from "@/lib/goals";
import { localDay } from "@/lib/entries/time";
import { createClient } from "@/lib/supabase/server";
import { GoalNudgeCard } from "./goal-nudge-card";

/** Every so often (not daily), Pip suggests a goal for the week when there isn't one. */
export async function GoalNudge({ userId, timeZone }: { userId: string; timeZone: string }) {
  const supabase = await createClient();
  const { data } = await supabase.from("directions").select("horizon").eq("owner_id", userId).is("archived_at", null);
  const rows = data ?? [];
  const now = new Date();
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(now));
  const due = goalNudge({ hasWeekGoal: rows.some((r) => r.horizon === "week"), hasAnyGoal: rows.length > 0, weekday });
  if (!due) return null;
  const day = localDay(now, timeZone);
  const seed = [...day].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  return <GoalNudgeCard line={GOAL_NUDGE_LINES[seed % GOAL_NUDGE_LINES.length]} day={day} />;
}
