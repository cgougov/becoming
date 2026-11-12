import { formatDayLabel, formatTimeInTimeZone, startOfDayInTimeZone } from "@/lib/entries/time";
import { createClient } from "@/lib/supabase/server";
import { DeleteEntryButton } from "./delete-entry-button";

interface EntryRow {
  id: string;
  body: string | null;
  photo_path: string | null;
  captured_at: string;
  bucket_id: string | null;
}

export async function TodayList({ userId, timeZone }: { userId: string; timeZone: string }) {
  const supabase = await createClient();
  const now = new Date();
  const start = startOfDayInTimeZone(now, timeZone);

  const { data } = await supabase
    .from("entries")
    .select("id, body, photo_path, captured_at, bucket_id")
    .eq("owner_id", userId)
    .gte("captured_at", start.toISOString())
    .order("captured_at", { ascending: false });

  const entries = (data ?? []) as EntryRow[];
  const photoPaths = entries.map((e) => e.photo_path).filter((p): p is string => !!p);
  const signed = photoPaths.length
    ? await supabase.storage.from("photos").createSignedUrls(photoPaths, 60 * 60)
    : { data: [] as { path: string | null; signedUrl: string }[] };
  const urlFor = new Map((signed.data ?? []).map((s) => [s.path, s.signedUrl]));

  return (
    <section className="flex flex-col gap-3" aria-label="Today">
      <h2 className="text-sm font-medium uppercase tracking-wide opacity-50">{formatDayLabel(now, timeZone)}</h2>
      {entries.length === 0 ? (
        <p className="text-sm opacity-50">Nothing yet today. Anything counts.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((e) => {
            const url = e.photo_path ? urlFor.get(e.photo_path) : undefined;
            return (
              <li key={e.id} className="group rounded-2xl border border-current/10 p-3">
                {url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="mb-2 max-h-72 w-full rounded-xl object-cover" loading="lazy" />
                )}
                {e.body && <p className="whitespace-pre-wrap text-base">{e.body}</p>}
                <div className="mt-1 flex items-center justify-between text-xs opacity-50">
                  <span>{formatTimeInTimeZone(new Date(e.captured_at), timeZone)}</span>
                  <DeleteEntryButton id={e.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
