import { Suspense } from "react";
import { Pane } from "@/components/pane";
import { createClient, getUser } from "@/lib/supabase/server";
import { BucketCards } from "../capture/bucket-cards";
import { TodayWidget } from "./today-widget";

export default function YouPage() {
  return (
    <Pane title="You" subtitle="What you've been keeping.">
      <Suspense fallback={<p className="text-sm opacity-50">Loading…</p>}>
        <Widgets />
      </Suspense>
    </Pane>
  );
}

async function Widgets() {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle();
  const timeZone = profile?.timezone ?? "America/New_York";
  return (
    <>
      <TodayWidget userId={user.id} timeZone={timeZone} />
      <BucketCards userId={user.id} />
      <form action="/auth/signout" method="post" className="mt-auto flex items-center justify-between text-sm opacity-60">
        <span>{user.email}</span>
        <button type="submit" className="underline">
          Sign out
        </button>
      </form>
    </>
  );
}
