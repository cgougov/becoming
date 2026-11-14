import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Pane } from "@/components/pane";
import { tagOptions, withTags } from "@/lib/entries/tags";
import { requireUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { PhotoPicker } from "@/components/photo-picker";
import { ENTRY_FIELDS, EntryList, type EntryRow } from "../../capture/entry-list";
import { setCollectionCover } from "../actions";

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
      <div className="-mt-4 flex items-center justify-between text-sm text-muted">
        <Link href="/you" className="underline-offset-2 hover:underline">
          ← yours
        </Link>
        <PhotoPicker userId={user.id} onPath={setCollectionCover.bind(null, collection.id)} label="set a cover photo" className="font-semibold" />
      </div>
      <EntryList entries={entries} timeZone={timeZone} options={options} showDate empty="nothing tagged here yet." />
    </Pane>
  );
}
