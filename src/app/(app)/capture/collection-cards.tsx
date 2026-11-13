import Link from "next/link";
import { dotColor } from "@/lib/collections";
import { createClient } from "@/lib/supabase/server";

interface CollectionRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
}

/** Collections as white tiles with a dot, a count and the latest thing kept. Tap opens the scrapbook. */
export async function CollectionCards({ userId }: { userId: string }) {
  const supabase = await createClient();
  const [{ data: collections }, { data: entries }] = await Promise.all([
    supabase.from("collections").select("id, slug, name, description, position").eq("owner_id", userId).order("position"),
    supabase
      .from("entries")
      .select("collection_id, body, photo_path, captured_at")
      .eq("owner_id", userId)
      .order("captured_at", { ascending: false }),
  ]);

  const tally = new Map<string | null, number>();
  const latest = new Map<string | null, { body: string | null; photo_path: string | null }>();
  for (const row of (entries ?? []) as { collection_id: string | null; body: string | null; photo_path: string | null }[]) {
    tally.set(row.collection_id, (tally.get(row.collection_id) ?? 0) + 1);
    if (!latest.has(row.collection_id)) latest.set(row.collection_id, row);
  }
  const unsorted = tally.get(null) ?? 0;

  return (
    <section className="grid grid-cols-2 gap-2.5" aria-label="Collections">
      {((collections ?? []) as CollectionRow[]).map((c) => {
        const last = latest.get(c.id);
        return (
          <Link
            key={c.id}
            href={`/you/${c.slug}`}
            className="flex min-h-[132px] flex-col justify-between rounded-card bg-surface p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-transform active:scale-[0.98]"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="flex items-center gap-2 text-[16px] font-semibold">
                <span className="h-2 w-2 flex-none rounded-full" style={{ background: dotColor(c.slug) }} />
                <span className="truncate">{c.name}</span>
              </h2>
              <span className="text-[13px] font-semibold tabular-nums text-muted">{tally.get(c.id) ?? 0}</span>
            </div>
            <p className="line-clamp-2 text-[13px] leading-[1.3] text-foreground/60">
              {last?.body ?? (last?.photo_path ? "A photo." : (c.description ?? "Nothing yet."))}
            </p>
          </Link>
        );
      })}
      {unsorted > 0 && (
        <Link href="/you/unsorted" className="col-span-2 text-xs font-semibold text-muted underline-offset-2 hover:underline">
          {unsorted} not filed yet
        </Link>
      )}
    </section>
  );
}
