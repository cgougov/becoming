import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface CollectionRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
}

/** One card per collection with a count; tapping opens the collection's scrapbook. */
export async function CollectionCards({ userId }: { userId: string }) {
  const supabase = await createClient();
  const [{ data: collections }, { data: counts }] = await Promise.all([
    supabase.from("collections").select("id, slug, name, description, position").eq("owner_id", userId).order("position"),
    supabase.from("entries").select("collection_id").eq("owner_id", userId),
  ]);

  const tally = new Map<string | null, number>();
  for (const row of (counts ?? []) as { collection_id: string | null }[]) {
    tally.set(row.collection_id, (tally.get(row.collection_id) ?? 0) + 1);
  }
  const unsorted = tally.get(null) ?? 0;

  return (
    <section className="grid gap-3" aria-label="Collections">
      {((collections ?? []) as CollectionRow[]).map((b) => (
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
          {unsorted} not filed yet
        </Link>
      )}
    </section>
  );
}
