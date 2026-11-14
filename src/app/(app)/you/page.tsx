import { NotifySwitch } from "../notify/notify-switch";
import { Suspense } from "react";
import { Pane } from "@/components/pane";
import { requireUser } from "@/lib/session";
import { CollectionCards } from "../capture/collection-cards";
import { Directions } from "./directions";
import { NewCollectionForm } from "./new-collection-form";
import { PeopleRow } from "./people-row";

/** Yours: who you're becoming, your people, your collections. All from your days. */
export default function YouPage() {
  return (
    <Pane big title="Yours" subtitle="all from your days.">
      <Suspense fallback={<p className="text-sm text-muted">loading…</p>}>
        <Sections />
      </Suspense>
    </Pane>
  );
}

async function Sections() {
  const session = await requireUser();
  if (!session) return null;
  const { user, timeZone } = session;
  return (
    <>
      <Directions userId={user.id} timeZone={timeZone} />
      <PeopleRow userId={user.id} />
      <section className="flex flex-col gap-3" aria-label="Collections">
        <h2 className="text-[13px] font-bold text-muted">collections</h2>
        <CollectionCards userId={user.id} />
        <NewCollectionForm />
      </section>
      <section className="rounded-card bg-chip p-4" aria-label="Notifications">
        <NotifySwitch />
      </section>
      <form action="/auth/signout" method="post" className="mt-auto flex items-center justify-between pt-4 text-[13px] text-muted">
        <span>{user.email}</span>
        <button type="submit" className="underline">
          sign out
        </button>
      </form>
    </>
  );
}
