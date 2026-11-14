import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Pane } from "@/components/pane";
import { tagOptions, withTags } from "@/lib/entries/tags";
import { requireUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { ENTRY_FIELDS, EntryList, type EntryRow } from "../../capture/entry-list";

export default function CollectionPage({ params }: PageProps<"/you/[slug]">) {
  return (
    <Suspense fallback={<Pane big title="…">{null}</Pane>}>
      <CollectionBody params={params} />
    </Suspense>
  );
}

/** A collection is a view of your days: everything tagged with it, newest first. */
async function CollectionBody({ params }: Pick<PageProps<"/you/[slug]">, "params">) {
  const { slug } = await params;
  const session = await requireUser();
  if (!session) return null;
  const { user, timeZone } = session;
  const supabase = await createClient();

  const { data: collection } = await supabase
    .from("collections")
    .select("id, name, description")
    .eq("owner_id", user.id)
    .eq("slug", slug)
    .maybeSingle();
  if (!collection) notFound();

  const { data: tagRows } = await supabase
    .from("entry_tags")
    .select("entry_id")
    .eq("owner_id", user.id)
    .eq("collection_id", collection.id);
  const ids = (tagRows ?? []).map((t) => t.entry_id as string);
  const [{ data }, options] = await Promise.all([
    ids.length
      ? supabase.from("entries").select(ENTRY_FIELDS).in("id", ids).order("captured_at", { ascending: false }).limit(200)
      : Promise.resolve({ data: [] }),
    tagOptions(user.id),
  ]);
  const entries = await withTags(user.id, (data ?? []) as Omit<EntryRow, "tags">[]);

  return (
    <Pane big title={collection.name} subtitle={collection.description ?? "from your days"}>
      <Link href="/you" className="-mt-4 text-sm text-muted underline-offset-2 hover:underline">
        ← yours
      </Link>
      <EntryList entries={entries} timeZone={timeZone} options={options} showDate empty="nothing tagged here yet." />
    </Pane>
  );
}
