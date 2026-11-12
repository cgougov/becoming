import { dotColor } from "@/lib/collections";
import { formatTimeInTimeZone } from "@/lib/entries/time";
import { createClient } from "@/lib/supabase/server";
import { DeleteEntryButton } from "./delete-entry-button";

export interface EntryRow {
  id: string;
  body: string | null;
  photo_path: string | null;
  captured_at: string;
  collection_id: string | null;
  collection?: { slug: string; name: string } | null;
}

export async function signedPhotoUrls(paths: string[]): Promise<Map<string, string>> {
  if (paths.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase.storage.from("photos").createSignedUrls(paths, 60 * 60);
  return new Map(
    (data ?? []).flatMap((s) => (s.path && s.signedUrl ? [[s.path, s.signedUrl] as [string, string]] : [])),
  );
}

/** Kept things as quiet white cards: photo as a rounded thumb, a dot for the collection. */
export async function EntryList({
  entries,
  timeZone,
  showDate = false,
  empty = "Nothing here yet. Anything counts.",
}: {
  entries: EntryRow[];
  timeZone: string;
  showDate?: boolean;
  empty?: string;
}) {
  const urlFor = await signedPhotoUrls(entries.map((e) => e.photo_path).filter((p): p is string => !!p));
  if (entries.length === 0) return <p className="text-sm text-muted">{empty}</p>;

  return (
    <ul className="flex flex-col gap-2.5">
      {entries.map((e) => {
        const url = e.photo_path ? urlFor.get(e.photo_path) : undefined;
        const at = new Date(e.captured_at);
        const stamp = showDate
          ? new Intl.DateTimeFormat("en-US", { timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(at)
          : formatTimeInTimeZone(at, timeZone);
        const slug = e.collection?.slug ?? null;
        return (
          <li key={e.id} className="group flex items-center gap-3 rounded-card bg-surface p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            {url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="h-[72px] w-[72px] flex-none rounded-2xl object-cover" loading="lazy" />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {e.body && <p className="whitespace-pre-wrap text-[15px] font-medium leading-[1.35]">{e.body}</p>}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: dotColor(slug) }} />
                <span>{e.collection?.name ? `${e.collection.name} · ` : ""}{stamp}</span>
                <span className="ml-auto">
                  <DeleteEntryButton id={e.id} />
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
