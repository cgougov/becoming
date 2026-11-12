import { formatTimeInTimeZone } from "@/lib/entries/time";
import { createClient } from "@/lib/supabase/server";
import { DeleteEntryButton } from "./delete-entry-button";

export interface EntryRow {
  id: string;
  body: string | null;
  photo_path: string | null;
  captured_at: string;
  bucket_id: string | null;
}

export async function signedPhotoUrls(paths: string[]): Promise<Map<string, string>> {
  if (paths.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase.storage.from("photos").createSignedUrls(paths, 60 * 60);
  return new Map(
    (data ?? []).flatMap((s) => (s.path && s.signedUrl ? [[s.path, s.signedUrl] as [string, string]] : [])),
  );
}

/** A scrapbook list: newest first, photos signed for an hour, remove on hover. */
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
  if (entries.length === 0) return <p className="text-sm opacity-50">{empty}</p>;

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((e) => {
        const url = e.photo_path ? urlFor.get(e.photo_path) : undefined;
        const at = new Date(e.captured_at);
        const stamp = showDate
          ? new Intl.DateTimeFormat("en-US", { timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(at)
          : formatTimeInTimeZone(at, timeZone);
        return (
          <li key={e.id} className="group rounded-2xl border border-current/10 p-3">
            {url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="mb-2 max-h-72 w-full rounded-xl object-cover" loading="lazy" />
            )}
            {e.body && <p className="whitespace-pre-wrap text-base">{e.body}</p>}
            <div className="mt-1 flex items-center justify-between text-xs opacity-50">
              <span>{stamp}</span>
              <DeleteEntryButton id={e.id} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
