"use server";

import { revalidatePath } from "next/cache";
import { checkDay, type CheckKind } from "@/lib/checkins";
import { localDay, localHour } from "@/lib/entries/time";
import { normalizeIntention } from "@/lib/intention";
import { createClient } from "@/lib/supabase/server";

async function ctx() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle();
  const timeZone = data?.timezone ?? "America/New_York";
  const now = new Date();
  return { supabase, user, timeZone, today: localDay(now, timeZone), hour: localHour(now, timeZone) };
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/**
 * Save a morning check-in or a wind-down. Morning text becomes today's intention; evening text
 * becomes a kept thing on the day's page (and gets tagged like anything else).
 */
export async function saveCheckin(input: { kind: CheckKind; mood: number; energy: number; text?: string; tomorrow?: string }): Promise<{ ok: boolean }> {
  const c = await ctx();
  if (!c) return { ok: false };
  const day = checkDay(input.kind, c.today, c.hour);
  const text = input.text?.trim() || "";
  let entryId: string | null = null;

  if (text && input.kind === "evening") {
    const { data: created } = await c.supabase
      .from("entries")
      .insert({ owner_id: c.user.id, body: text, source: "check_in" })
      .select("id")
      .maybeSingle();
    entryId = (created?.id as string | undefined) ?? null;
    if (entryId) {
      try {
        const { tagEntryWith } = await import("@/lib/partner/run-tagging");
        await tagEntryWith(c.supabase, c.user.id, entryId);
      } catch {
        // the nightly safety net will tag it
      }
    }
  }
  if (text && input.kind === "morning") {
    const t = normalizeIntention(text);
    if (t) await c.supabase.from("intentions").upsert({ owner_id: c.user.id, day: c.today, text: t, done_at: null }, { onConflict: "owner_id,day" });
  }

  const row = { owner_id: c.user.id, day, kind: input.kind, mood: clamp(input.mood), energy: clamp(input.energy), skipped: false, entry_id: entryId };
  const tomorrow = input.kind === "evening" ? normalizeIntention(input.tomorrow ?? "") : null;
  const withTomorrow: Record<string, unknown> = tomorrow ? { ...row, tomorrow } : row;
  let { error } = await c.supabase.from("day_checks").upsert(withTomorrow, { onConflict: "owner_id,day,kind" });
  // Before the `tomorrow` migration is applied, save the rest anyway.
  if (error && tomorrow) ({ error } = await c.supabase.from("day_checks").upsert(row, { onConflict: "owner_id,day,kind" }));
  revalidatePath("/");
  return { ok: !error };
}

/** "not now": hides it for the day. Nothing else happens. */
export async function skipCheckin(kind: CheckKind): Promise<void> {
  const c = await ctx();
  if (!c) return;
  await c.supabase
    .from("day_checks")
    .upsert({ owner_id: c.user.id, day: checkDay(kind, c.today, c.hour), kind, skipped: true }, { onConflict: "owner_id,day,kind", ignoreDuplicates: true });
  revalidatePath("/");
}
