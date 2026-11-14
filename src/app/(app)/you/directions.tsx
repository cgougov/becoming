import { periodStart, progressLine, type Horizon } from "@/lib/goals";
import { gradientFor } from "@/lib/gradients";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "../capture/entry-list";
import { DirectionCard, NewDirectionForm } from "./directions-client";

const HORIZON_LABEL = { week: "this week", month: "this month", year: "this year" } as const;

/** Who you're becoming: directions in your words, with a horizon and an optional photo. */
export async function Directions({ userId, timeZone }: { userId: string; timeZone: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("directions")
    .select("id, text, horizon, photo_path")
    .eq("owner_id", userId)
    .is("archived_at", null)
    .order("created_at", { ascending: true });
  const rows = (data ?? []) as { id: string; text: string; horizon: keyof typeof HORIZON_LABEL; photo_path: string | null }[];
  // What you kept toward each one, in its own horizon (tolerant: empty before the migration).
  const now = new Date();
  const { data: links } = rows.length
    ? await supabase.from("direction_links").select("entry_id, direction_id").eq("owner_id", userId).in("direction_id", rows.map((r) => r.id))
    : { data: [] as { entry_id: string; direction_id: string }[] };
  const entryIds = [...new Set((links ?? []).map((l) => l.entry_id as string))];
  const { data: entries } = entryIds.length
    ? await supabase.from("entries").select("id, body, photo_path, captured_at").in("id", entryIds).order("captured_at", { ascending: false })
    : { data: [] as { id: string; body: string | null; photo_path: string | null; captured_at: string }[] };
  const byId = new Map((entries ?? []).map((e) => [e.id as string, e]));
  const progress = new Map<string, { count: number; latest: string | null; photos: string[] }>();
  for (const r of rows) {
    const since = periodStart(r.horizon as Horizon, now, timeZone).getTime();
    const mine = (links ?? [])
      .filter((l) => l.direction_id === r.id)
      .map((l) => byId.get(l.entry_id as string))
      .filter((e): e is NonNullable<typeof e> => !!e && new Date(e.captured_at as string).getTime() >= since)
      .sort((a, b) => (a.captured_at < b.captured_at ? 1 : -1));
    progress.set(r.id, {
      count: mine.length,
      latest: (mine.find((e) => e.body)?.body as string | undefined) ?? null,
      photos: mine.map((e) => e.photo_path as string | null).filter((p): p is string => !!p).slice(0, 3),
    });
  }
  const urls = await signedPhotoUrls([
    ...rows.map((r) => r.photo_path).filter((x): x is string => !!x),
    ...[...progress.values()].flatMap((p) => p.photos),
  ]);

  return (
    <section className="flex flex-col gap-3" aria-label="Who you're becoming">
      <h2 className="text-[13px] font-bold text-muted">who you&apos;re becoming</h2>
      {rows.map((r) => (
        <DirectionCard
          key={r.id}
          id={r.id}
          userId={userId}
          text={r.text}
          horizon={HORIZON_LABEL[r.horizon]}
          progress={progressLine(progress.get(r.id)?.count ?? 0, r.horizon as Horizon)}
          latest={progress.get(r.id)?.latest ?? null}
          thumbs={(progress.get(r.id)?.photos ?? []).map((p) => urls.get(p)).filter((u): u is string => !!u)}
          background={r.photo_path && urls.get(r.photo_path) ? `url("${urls.get(r.photo_path)}") center / cover` : gradientFor(r.id)}
        />
      ))}
      <NewDirectionForm empty={rows.length === 0} />
    </section>
  );
}
