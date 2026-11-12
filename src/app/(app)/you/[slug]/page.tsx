import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Pane } from "@/components/pane";
import { createClient, getUser } from "@/lib/supabase/server";
import { EntryList, type EntryRow } from "../../capture/entry-list";

export default function BucketPage({ params }: PageProps<"/you/[slug]">) {
  return (
    <Suspense fallback={<Pane title="…">{null}</Pane>}>
      <BucketBody params={params} />
    </Suspense>
  );
}

async function BucketBody({ params }: Pick<PageProps<"/you/[slug]">, "params">) {
  const { slug } = await params;
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();

  const [{ data: profile }, { data: bucket }] = await Promise.all([
    supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle(),
    slug === "unsorted"
      ? Promise.resolve({ data: { id: null, name: "Unsorted", description: "Not filed yet. Auto-sorting arrives in M3." } })
      : supabase.from("buckets").select("id, name, description").eq("owner_id", user.id).eq("slug", slug).maybeSingle(),
  ]);
  if (!bucket) notFound();
  const timeZone = profile?.timezone ?? "America/New_York";

  let q = supabase
    .from("entries")
    .select("id, body, photo_path, captured_at, bucket_id")
    .eq("owner_id", user.id)
    .order("captured_at", { ascending: false })
    .limit(100);
  q = bucket.id ? q.eq("bucket_id", bucket.id) : q.is("bucket_id", null);
  const { data } = await q;

  return (
    <Pane title={bucket.name} subtitle={bucket.description ?? undefined}>
      <Link href="/you" className="-mt-4 text-sm opacity-60 underline-offset-2 hover:underline">
        ← You
      </Link>
      <EntryList entries={(data ?? []) as EntryRow[]} timeZone={timeZone} showDate />
    </Pane>
  );
}
