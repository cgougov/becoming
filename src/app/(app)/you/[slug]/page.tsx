import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Pane } from "@/components/pane";
import { requireUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { EntryList, type EntryRow } from "../../capture/entry-list";

export default function CollectionPage({ params }: PageProps<"/you/[slug]">) {
  return (
    <Suspense fallback={<Pane title="…">{null}</Pane>}>
      <CollectionBody params={params} />
    </Suspense>
  );
}

async function CollectionBody({ params }: Pick<PageProps<"/you/[slug]">, "params">) {
  const { slug } = await params;
  const session = await requireUser();
  if (!session) return null;
  const { user, timeZone } = session;
  const supabase = await createClient();

  const { data: collection } =
    slug === "unsorted"
      ? { data: { id: null, name: "Unsorted", description: "Captures that haven't found a collection yet." } }
      : await supabase.from("collections").select("id, name, description").eq("owner_id", user.id).eq("slug", slug).maybeSingle();
  if (!collection) notFound();

  let q = supabase
    .from("entries")
    .select("id, body, photo_path, captured_at, collection_id")
    .eq("owner_id", user.id)
    .order("captured_at", { ascending: false })
    .limit(100);
  q = collection.id ? q.eq("collection_id", collection.id) : q.is("collection_id", null);
  const { data } = await q;

  return (
    <Pane title={collection.name} subtitle={collection.description ?? undefined}>
      <Link href="/you" className="-mt-4 text-sm opacity-60 underline-offset-2 hover:underline">
        ← You
      </Link>
      <EntryList entries={(data ?? []) as EntryRow[]} timeZone={timeZone} showDate />
    </Pane>
  );
}
