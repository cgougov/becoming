import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { tagEntryWith } from "@/lib/partner/run-tagging";

/**
 * Safety net for live tagging: once a night, tag anything that was kept but never read
 * (offline, API hiccup, the app closed mid-keep). Vercel Cron (vercel.json) with
 * `Authorization: Bearer $CRON_SECRET`; service role, scoped by owner_id in every query.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: "supabase not configured" }, { status: 500 });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: pending } = await admin
    .from("entries")
    .select("id, owner_id")
    .is("tagged_at", null)
    .order("captured_at", { ascending: false })
    .limit(200);

  let tagged = 0;
  const errors: string[] = [];
  for (const e of pending ?? []) {
    try {
      const r = await tagEntryWith(admin, e.owner_id as string, e.id as string);
      if (r.tagged) tagged++;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }
  return NextResponse.json({ pending: pending?.length ?? 0, tagged, errors: errors.slice(0, 5) });
}
