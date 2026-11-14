import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Pane } from "@/components/pane";
import { tagOptions, withTags } from "@/lib/entries/tags";
import { periodStart, progressLine, type Horizon } from "@/lib/goals";
import { requireUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ENTRY_FIELDS, EntryList, type EntryRow } from "../../../capture/entry-list";

export default function GoalPage({ params }: PageProps<"/you/goal/[id]">) {
  return (
    <Suspense fallback={<Pane big title="…">{null}</Pane>}>
      <GoalBody params={params} />
    </Suspense>
  );
}

/** A goal's page: everything you kept that moved you toward it. Pip links them as you keep. */
async function GoalBody({ params }: Pick<PageProps<"/you/goal/[id]">, "params">) {
  const { id } = await params;
  const session = await requireUser();
  if (!session) return null;
  const { user, timeZone } = session;
  const supabase = await createClient();
  const { data: goal } = await supabase.from("directions").select("id, text, horizon").eq("owner_id", user.id).eq("id", id).maybeSingle();
  if (!goal) notFound();

  const { data: links } = await supabase.from("direction_links").select("entry_id").eq("owner_id", user.id).eq("direction_id", id);
  const ids = (links ?? []).map((l) => l.entry_id as string);
  const [{ data }, options] = await Promise.all([
    ids.length
      ? supabase.from("entries").select(ENTRY_FIELDS).in("id", ids).order("captured_at", { ascending: false }).limit(200)
      : Promise.resolve({ data: [] }),
    tagOptions(user.id),
  ]);
  const entries = await withTags(user.id, (data ?? []) as Omit<EntryRow, "tags">[]);
  const horizon = goal.horizon as Horizon;
  const since = periodStart(horizon, new Date(), timeZone).getTime();
  const inPeriod = entries.filter((e) => new Date(e.captured_at).getTime() >= since).length;

  return (
    <Pane big title={goal.text as string} subtitle={`${progressLine(inPeriod, horizon)} · ${entries.length} in all`}>
      <Link href="/you" className="-mt-4 text-sm text-muted underline-offset-2 hover:underline">
        ← yours
      </Link>
      <EntryList entries={entries} timeZone={timeZone} options={options} showDate empty="nothing yet. Pip links things here as you keep them." />
    </Pane>
  );
}
