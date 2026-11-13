import { Suspense } from "react";
import { Pane } from "@/components/pane";
import { startOfWeekInTimeZone } from "@/lib/entries/time";
import { requireUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "../capture/entry-list";
import { WeekDots } from "../you/week-dots";

export default function ReflectPage() {
  return (
    <Pane big title="Look back" aside="Last 7 days">
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
      <WeekDots userId={user.id} timeZone={timeZone} />
      <section className="grid grid-cols-3 gap-2" aria-label="This week">
        <Stat label="kept" value={entries.length} />
        <Stat label="photos" value={entries.filter((e) => e.photo_path).length} />
        <Stat label={days === 1 ? "day" : "days"} value={days} />
      </section>

      {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5">
          {photos.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p} src={urlFor.get(p)} alt="" className="aspect-square w-full rounded-2xl object-cover" loading="lazy" />
          ))}
        </div>
      )}

      <section className="mt-auto rounded-card bg-foreground p-4 text-[14px] leading-relaxed text-background">
        <p className="mb-1 text-xs font-semibold text-background/50">From your partner · an AI</p>
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
    <div className="flex flex-col gap-0.5 rounded-2xl bg-chip p-3">
      <div className="text-[22px] font-semibold tabular-nums tracking-[-0.02em]">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
