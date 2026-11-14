import { gradientFor } from "@/lib/gradients";
import { createClient } from "@/lib/supabase/server";
import { signedPhotoUrls } from "../capture/entry-list";
import { DirectionCard, NewDirectionForm } from "./directions-client";

const HORIZON_LABEL = { week: "this week", month: "this month", year: "this year" } as const;

/** Who you're becoming: directions in your words, with a horizon and an optional photo. */
export async function Directions({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("directions")
    .select("id, text, horizon, photo_path")
    .eq("owner_id", userId)
    .is("archived_at", null)
    .order("created_at", { ascending: true });
  const rows = (data ?? []) as { id: string; text: string; horizon: keyof typeof HORIZON_LABEL; photo_path: string | null }[];
  const urls = await signedPhotoUrls(rows.map((r) => r.photo_path).filter((x): x is string => !!x));

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
          background={r.photo_path && urls.get(r.photo_path) ? `url("${urls.get(r.photo_path)}") center / cover` : gradientFor(r.id)}
        />
      ))}
      <NewDirectionForm empty={rows.length === 0} />
    </section>
  );
}
