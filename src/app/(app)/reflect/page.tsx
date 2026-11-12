import { Suspense } from "react";
import { Pane } from "@/components/pane";
import { startOfWeekInTimeZone } from "@/lib/entries/time";
import { requireUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "../capture/entry-list";

export default function ReflectPage() {
  return (
    <Pane title="Reflect" subtitle="This week so far.">
      <Suspense fallback={<p className="text-sm opacity-50">Loading…</p>}>
        <WeekSoFar />
      </Suspense>
    </Pane>
  );
}

async function WeekSoFar() {
  const session = await requireUser();
  if (!session) return null;
  const { user, timeZone } = session;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("created_at").eq("id", user.id).maybeSingle();
  const now = new Date();
  const weekStart = startOfWeekInTimeZone(now, timeZone);

  const { data } = await supabase
    .from("entries")
    .select("id, body, photo_path, captured_at")
    .eq("owner_id", user.id)
    .gte("captured_at", weekStart.toISOString())
    .order("captured_at", { ascending: false });
  const entries = data ?? [];
  const photos = entries.map((e) => e.photo_path).filter((p): p is string => !!p).slice(0, 4);
  const urlFor = await signedPhotoUrls(photos);
  const days = new Set(entries.map((e) => new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date(e.captured_at)))).size;

  const since = profile?.created_at ? new Date(profile.created_at) : now;
  const daysLogging = Math.max(1, Math.floor((now.getTime() - since.getTime()) / 86_400_000) + 1);
  const unlockIn = Math.max(0, 7 - daysLogging);

  return (
    <>
      <section className="grid grid-cols-3 gap-3" aria-label="This week">
        <Stat label="captures" value={entries.length} />
        <Stat label="photos" value={entries.filter((e) => e.photo_path).length} />
        <Stat label={days === 1 ? "day" : "days"} value={days} />
      </section>

      {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p} src={urlFor.get(p)} alt="" className="aspect-square w-full rounded-xl object-cover" loading="lazy" />
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-current/10 bg-current/[.03] p-4 text-sm leading-relaxed">
        <p className="mb-1 text-xs uppercase tracking-wide opacity-50">From your partner (an AI)</p>
        {unlockIn > 0 ? (
          <p>
            I&apos;ll have a real question for you after about a week of logging — roughly {unlockIn} more{" "}
            {unlockIn === 1 ? "day" : "days"}. Until then this is just what your week looks like. No streaks, nothing to keep up.
          </p>
        ) : (
          <p>You&apos;ve been at this a week. Reflection questions arrive in the next build (M5).</p>
        )}
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-current/10 p-3 text-center">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs opacity-50">{label}</div>
    </div>
  );
}
