import { Suspense } from "react";
import { createClient, getUser } from "@/lib/supabase/server";
import { BucketCards } from "./capture/bucket-cards";
import { CaptureForm } from "./capture/capture-form";
import { TodayList } from "./capture/today-list";
import { AccountFooter, HomeView } from "./home-view";

export default function Home() {
  return (
    <Suspense fallback={<HomeView />}>
      <SignedInHome />
    </Suspense>
  );
}

async function SignedInHome() {
  const user = await getUser();
  // Unconfigured or (briefly) signed out: the proxy redirects to /login; show the shell meanwhile.
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
      buckets={
        <Suspense>
          <BucketCards userId={user.id} />
        </Suspense>
      }
      account={<AccountFooter email={user.email} />}
    />
  );
}
