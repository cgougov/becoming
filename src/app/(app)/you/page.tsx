import { Suspense } from "react";
import { Pane } from "@/components/pane";
import { requireUser } from "@/lib/session";
import { CollectionCards } from "../capture/collection-cards";
import { NewCollectionForm } from "./new-collection-form";
import { TodayWidget } from "./today-widget";
import { WeekDots } from "./week-dots";

export default function YouPage() {
  return (
    <Pane big title="Yours" subtitle="What you keep track of.">
      <Suspense fallback={<p className="text-sm opacity-50">Loading…</p>}>
        <Widgets />
      </Suspense>
    </Pane>
  );
}

async function Widgets() {
  const session = await requireUser();
  if (!session) return null;
  const { user, timeZone } = session;
  return (
    <>
      <WeekDots userId={user.id} timeZone={timeZone} />
      <TodayWidget userId={user.id} timeZone={timeZone} />
      <CollectionCards userId={user.id} />
      <NewCollectionForm />
      <form action="/auth/signout" method="post" className="mt-auto flex items-center justify-between text-[13px] text-muted">
        <span>{user.email}</span>
        <button type="submit" className="underline">
          Sign out
        </button>
      </form>
    </>
  );
}
