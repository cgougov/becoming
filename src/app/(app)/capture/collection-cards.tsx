import Link from "next/link";
import { emptyTileLine } from "@/lib/collections";
import { gradientOf, toneAt } from "@/lib/gradients";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "./entry-list";

interface CollectionRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  position: number;
  origin: "suggested" | "user" | "partner";
  cover_path: string | null;
}

/** Collections as white tiles with a dot, a count and the latest thing kept. Tap opens the scrapbook. */
export async function CollectionCards({ userId }: { userId: string }) {
  const supabase = await createClient();
  const [{ data: collections }, { data: tags }] = await Promise.all([
    supabase.from("collections").select("id, slug, name, description, position, origin, cover_path").eq("owner_id", userId).order("position"),
    supabase.from("entry_tags").select("collection_id, entry_id").eq("owner_id", userId).eq("kind", "collection"),
  ]);
  // Collections are views of your days: count tags, and find each one's latest kept thing.
  const entryIds = [...new Set((tags ?? []).map((t) => t.entry_id as string))];
  const { data: entries } = entryIds.length
    ? await supabase.from("entries").select("id, body, photo_path, captured_at").in("id", entryIds).order("captured_at", { ascending: false })
    : { data: [] as { id: string; body: string | null; photo_path: string | null; captured_at: string }[] };
  const rank = new Map((entries ?? []).map((e, i) => [e.id as string, i]));
  const entryById = new Map((entries ?? []).map((e) => [e.id as string, e]));

  const tally = new Map<string, number>();
  const latest = new Map<string, { body: string | null; photo_path: string | null }>();
  const best = new Map<string, number>();
  for (const t of tags ?? []) {
    const cid = t.collection_id as string;
    tally.set(cid, (tally.get(cid) ?? 0) + 1);
    const r = rank.get(t.entry_id as string);
    if (r !== undefined && (best.get(cid) === undefined || r < (best.get(cid) as number))) {
      best.set(cid, r);
      const e = entryById.get(t.entry_id as string);
      if (e) latest.set(cid, { body: e.body as string | null, photo_path: e.photo_path as string | null });
    }
  }
  const coverPaths = [
    ...((collections ?? []) as CollectionRow[]).map((c) => c.cover_path),
    ...[...latest.values()].map((l) => l.photo_path),
  ].filter((p): p is string => !!p);
  const covers = await signedPhotoUrls(coverPaths);

  return (
    <section className="grid grid-cols-2 gap-2.5" aria-label="Collections">
      {((collections ?? []) as CollectionRow[]).map((c, i) => {
        const tone = toneAt(i);
        const last = latest.get(c.id);
        // Your own cover first, then the latest photo kept there, then a soft gradient.
        const cover = (c.cover_path && covers.get(c.cover_path)) || (last?.photo_path ? covers.get(last.photo_path) : undefined);
        return (
          <Link
            key={c.id}
            href={`/you/${c.slug}`}
            className="relative flex min-h-[148px] flex-col justify-between overflow-hidden rounded-card p-3.5 text-white"
            style={cover ? undefined : { background: gradientOf(tone) }}
          >
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            )}
            <div className={`absolute inset-0 bg-gradient-to-t ${cover ? "from-black/65 via-black/15" : "from-black/35 via-transparent"} to-transparent`} />
            <div className="relative flex items-baseline justify-between gap-2">
              <h2 className="flex items-center gap-2 text-[16px] font-semibold [text-shadow:0_1px_6px_rgba(0,0,0,0.25)]">
                <span className="h-2 w-2 flex-none rounded-full" style={{ background: cover ? tone : "rgba(255,255,255,0.9)" }} />
                <span className="truncate">{c.name}</span>
              </h2>
              <span className="text-[13px] font-semibold tabular-nums text-white/70">{tally.get(c.id) ?? 0}</span>
            </div>
            {/* Once something is tagged here, the tile quotes it back to you. */}
            {last?.body ? (
              <p className="relative line-clamp-3 text-[13px] italic leading-[1.3] text-white/90">“{last.body}”</p>
            ) : (
              <p className="relative line-clamp-2 text-[13px] leading-[1.3] text-white/75">
                {last?.photo_path ? "a photo." : emptyTileLine(c.slug, c.description)}
              </p>
            )}
            {c.origin === "partner" && (
              <span className="relative mt-1 text-[11px] font-semibold text-white/70">started by your partner</span>
            )}
          </Link>
        );
      })}
    </section>
  );
}
