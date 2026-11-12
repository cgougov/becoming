import { Suspense } from "react";
import { createClient, getUser } from "@/lib/supabase/server";
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
  const user = await getUser();
  if (!user) return <HomeView />;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle();
  const timeZone = profile?.timezone ?? "America/New_York";

  return (
    <HomeView
      capture={<CaptureForm userId={user.id} />}
      today={
        <Suspense fallback={<p className="text-sm opacity-50">Loading today…</p>}>
          <TodayList userId={user.id} timeZone={timeZone} />
        </Suspense>
      }
    />
  );
}
