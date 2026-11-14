import { Suspense } from "react";
import { startOfDayInTimeZone } from "@/lib/entries/time";
import { requireUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { CaptureForm } from "./capture/capture-form";
import { DaysList } from "./capture/days-list";
import { HomeView } from "./home-view";
import { CheckinCard } from "./checkin/checkin-card";
import { MoodBar } from "./checkin/mood-bar";
import { NotifySwitch } from "./notify/notify-switch";
import { pendingCheck } from "./checkin/pending";
import { TodayIntention } from "./intention/today-intention";
import { PeopleNudge } from "./people-nudge";
import { MomentLine } from "./moment/moment-line";
import { ensureTodayMoment, phaseOf } from "./moment/today-moment";

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

  const due = await pendingCheck(user.id, timeZone);
  const morningPending = due?.kind === "morning"; // the morning check-in asks for the one thing instead
  const moment = await ensureTodayMoment(user.id, timeZone);
  const phase = moment ? phaseOf(moment, now) : "passed";
  const live = !!moment && phase === "live" && moment.status === "scheduled";

  return (
    <HomeView
      day={day}
      moment={moment && <MomentLine moment={moment} phase={phase} timeZone={timeZone} seed={now.getDate() + now.getHours()} />}
      moodBar={
        <Suspense>
          <MoodBar userId={user.id} timeZone={timeZone} />
        </Suspense>
      }
      checkin={
        <Suspense>
          <CheckinCard userId={user.id} timeZone={timeZone} />
        </Suspense>
      }
      nudge={
        <>
          <NotifySwitch variant="card" />
          <Suspense>
            <PeopleNudge userId={user.id} timeZone={timeZone} />
          </Suspense>
        </>
      }
      intention={
        <Suspense>
          <TodayIntention userId={user.id} timeZone={timeZone} hidePrompt={morningPending} />
        </Suspense>
      }
      capture={<CaptureForm userId={user.id} keptToday={count ?? 0} momentId={live ? moment.id : null} />}
      today={
        <Suspense fallback={<p className="text-sm text-muted">Loading today…</p>}>
          <DaysList userId={user.id} timeZone={timeZone} />
        </Suspense>
      }
    />
  );
}
