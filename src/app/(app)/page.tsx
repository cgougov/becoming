import { Suspense } from "react";
import { startOfDayInTimeZone } from "@/lib/entries/time";
import { requireUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { CaptureForm } from "./capture/capture-form";
import { TodayList } from "./capture/today-list";
import { HomeView } from "./home-view";
import { TodayIntention } from "./intention/today-intention";

export default function CapturePage() {
  return (
    <Suspense fallback={<HomeView />}>
      <SignedInCapture />
    </Suspense>
  );
}

async function SignedInCapture() {
  const session = await requireUser();
  if (!session) return <HomeView />;
  const { user, timeZone } = session;
  const now = new Date();
  const day = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(now);
  const supabase = await createClient();
  const { count } = await supabase
    .from("entries")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id)
    .gte("captured_at", startOfDayInTimeZone(now, timeZone).toISOString());

  return (
    <HomeView
      day={day}
      intention={
        <Suspense>
          <TodayIntention userId={user.id} timeZone={timeZone} />
        </Suspense>
      }
      capture={<CaptureForm userId={user.id} keptToday={count ?? 0} />}
      today={
        <Suspense fallback={<p className="text-sm text-muted">Loading today…</p>}>
          <TodayList userId={user.id} timeZone={timeZone} />
        </Suspense>
      }
    />
  );
}
