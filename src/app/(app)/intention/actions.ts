"use server";

import { revalidatePath } from "next/cache";
import { localDay } from "@/lib/entries/time";
import { normalizeIntention } from "@/lib/intention";
import { createClient } from "@/lib/supabase/server";

export type IntentionState = { status: "idle" } | { status: "error"; message: string } | { status: "ok" };

async function me() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle();
  return { supabase, user, timeZone: data?.timezone ?? "America/New_York" };
}

export async function setIntention(_prev: IntentionState, formData: FormData): Promise<IntentionState> {
  const text = normalizeIntention(String(formData.get("text") ?? ""));
  if (!text) return { status: "error", message: "Keep it to one line." };
  const ctx = await me();
  if (!ctx) return { status: "error", message: "Signed out." };
  const day = localDay(new Date(), ctx.timeZone);
  const { error } = await ctx.supabase
    .from("intentions")
    .upsert({ owner_id: ctx.user.id, day, text, done_at: null }, { onConflict: "owner_id,day" });
  if (error) return { status: "error", message: error.message };
  revalidatePath("/");
  revalidatePath("/you");
  return { status: "ok" };
}

export async function toggleIntentionDone(id: string, done: boolean): Promise<void> {
  const ctx = await me();
  if (!ctx) return;
  await ctx.supabase.from("intentions").update({ done_at: done ? new Date().toISOString() : null }).eq("id", id);
  revalidatePath("/");
  revalidatePath("/you");
}

export async function clearIntention(id: string): Promise<void> {
  const ctx = await me();
  if (!ctx) return;
  await ctx.supabase.from("intentions").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/you");
}
