"use server";

import { redirect } from "next/navigation";
import { buildInitialCollections } from "@/lib/collections";
import { normalizeDirection } from "@/lib/onboarding";

function parseGoals(raw: FormDataEntryValue | null): { text: string; horizon: string }[] {
  try {
    const list = JSON.parse(typeof raw === "string" ? raw : "[]") as unknown;
    if (!Array.isArray(list)) return [];
    return list
      .map((g) => ({ text: normalizeDirection((g as { text?: unknown })?.text), horizon: String((g as { horizon?: unknown })?.horizon) }))
      .filter((g): g is { text: string; horizon: string } => !!g.text && ["week", "month", "year"].includes(g.horizon))
      .slice(0, 12);
  } catch {
    return [];
  }
}
import { createClient } from "@/lib/supabase/server";

export async function completeSetup(formData: FormData): Promise<void> {
  const chosen = formData.getAll("suggested").map(String);
  const custom = formData.getAll("custom").map(String);
  const rows = buildInitialCollections(chosen, custom);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (rows.length > 0) {
    const { error } = await supabase
      .from("collections")
      .upsert(rows.map((r) => ({ ...r, owner_id: user.id })), { onConflict: "owner_id,slug", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
  }
  // "who do you want to become?": taps + follow-ups (and your own words) arrive as goals.
  const directions = parseGoals(formData.get("goals"));
  if (directions.length) await supabase.from("directions").insert(directions.map((d) => ({ ...d, owner_id: user.id })));

  const { error } = await supabase.from("profiles").update({ setup_completed_at: new Date().toISOString() }).eq("id", user.id);
  if (error) throw new Error(error.message);

  redirect("/");
}
