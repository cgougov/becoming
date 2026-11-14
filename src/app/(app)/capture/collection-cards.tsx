import Link from "next/link";
import { dotColor } from "@/lib/collections";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "./entry-list";

interface CollectionRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
  origin: "suggested" | "user" | "partner";
}

/** Collections as white tiles with a dot, a count and the latest thing kept. Tap opens the scrapbook. */
export async function CollectionCards({ userId }: { userId: string }) {
  const supabase = await createClient();
  const [{ data: collections }, { data: entries }] = await Promise.all([
    supabase.from("collections").select("id, slug, name, description, position, origin").eq("owner_id", userId).order("position"),
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
  const covers = await signedPhotoUrls([...latest.values()].map((l) => l.photo_path).filter((p): p is string => !!p));

  return (
    <section className="grid grid-cols-2 gap-2.5" aria-label="Collections">
      {((collections ?? []) as CollectionRow[]).map((c) => {
        const last = latest.get(c.id);
        const cover = last?.photo_path ? covers.get(last.photo_path) : undefined;
        return (
          <Link
            key={c.id}
            href={`/you/${c.slug}`}
            className="relative flex min-h-[148px] flex-col justify-between overflow-hidden rounded-card bg-chip p-3.5"
          >
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            )}
            {cover && <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />}
            <div className={`relative flex items-baseline justify-between gap-2 ${cover ? "text-white" : ""}`}>
              <h2 className="flex items-center gap-2 text-[16px] font-semibold">
                <span className="h-2 w-2 flex-none rounded-full" style={{ background: dotColor(c.slug) }} />
                <span className="truncate">{c.name}</span>
              </h2>
              <span className={`text-[13px] font-semibold tabular-nums ${cover ? "text-white/70" : "text-muted"}`}>{tally.get(c.id) ?? 0}</span>
            </div>
            <p className={`relative line-clamp-2 text-[13px] leading-[1.3] ${cover ? "text-white/85" : "text-foreground/60"}`}>
              {last?.body ?? (last?.photo_path ? "A photo." : (c.description ?? "Nothing yet."))}
            </p>
            {c.origin === "partner" && (
              <span className={`relative mt-1 text-[11px] font-semibold ${cover ? "text-white/70" : "text-accent"}`}>started by your partner</span>
            )}
          </Link>
        );
      })}
      {unsorted > 0 && (
        <Link href="/you/unsorted" className="col-span-2 text-xs font-semibold text-muted underline-offset-2 hover:underline">
          {unsorted} filing tonight
        </Link>
      )}
    </section>
  );
}
