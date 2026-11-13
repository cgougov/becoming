import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { CaptureForm } from "./capture/capture-form";
import { TodayList } from "./capture/today-list";
import { HomeView } from "./home-view";

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
  const day = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "long" }).format(new Date());

  return (
    <HomeView
      day={day}
      capture={<CaptureForm userId={user.id} />}
      today={
        <Suspense fallback={<p className="text-sm text-muted">Loading today…</p>}>
          <TodayList userId={user.id} timeZone={timeZone} />
        </Suspense>
      }
    />
  );
}
