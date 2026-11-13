import { dotColor } from "@/lib/collections";
import { formatTimeInTimeZone, localDay } from "@/lib/entries/time";
import { createClient } from "@/lib/supabase/server";
import { EntryLine } from "./entry-line";

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

/** Kept things as lines on a page: editable in place, a dot + filing status, a time. */
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
  const today = localDay(new Date(), timeZone);
  if (entries.length === 0) return <p className="text-sm text-muted">{empty}</p>;

  return (
    <ul className="flex flex-col divide-y divide-foreground/[0.06]">
      {entries.map((e) => {
        const at = new Date(e.captured_at);
        const stamp = showDate
          ? new Intl.DateTimeFormat("en-US", { timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(at)
          : formatTimeInTimeZone(at, timeZone);
        return (
          <EntryLine
            key={e.id}
            id={e.id}
            body={e.body}
            photoUrl={e.photo_path ? urlFor.get(e.photo_path) : undefined}
            stamp={stamp}
            dot={dotColor(e.collection?.slug ?? null)}
            status={e.collection?.name ?? "Filing tonight"}
            editable={localDay(at, timeZone) === today}
          />
        );
      })}
    </ul>
  );
}
