import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface BucketRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
}

/** One card per bucket with a count; tapping opens the bucket's scrapbook. */
export async function BucketCards({ userId }: { userId: string }) {
  const supabase = await createClient();
  const [{ data: buckets }, { data: counts }] = await Promise.all([
    supabase.from("buckets").select("id, slug, name, description, position").eq("owner_id", userId).order("position"),
    supabase.from("entries").select("bucket_id").eq("owner_id", userId),
  ]);

  const tally = new Map<string | null, number>();
  for (const row of (counts ?? []) as { bucket_id: string | null }[]) {
    tally.set(row.bucket_id, (tally.get(row.bucket_id) ?? 0) + 1);
  }
  const unsorted = tally.get(null) ?? 0;

  return (
    <section className="grid gap-3" aria-label="Buckets">
      {((buckets ?? []) as BucketRow[]).map((b) => (
        <Link
          key={b.id}
          href={`/you/${b.slug}`}
          className="flex items-baseline justify-between rounded-2xl border border-current/10 bg-current/[.03] p-4 transition-colors hover:bg-current/[.06]"
        >
          <div>
            <h2 className="font-medium">{b.name}</h2>
            {b.description && <p className="text-sm opacity-70">{b.description}</p>}
          </div>
          <span className="text-sm tabular-nums opacity-50">{tally.get(b.id) ?? 0}</span>
        </Link>
      ))}
      {unsorted > 0 && (
        <Link href="/you/unsorted" className="text-xs opacity-50 underline-offset-2 hover:underline">
          {unsorted} unsorted · auto-sorting arrives in M3
        </Link>
      )}
    </section>
  );
}
