import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { runFilingFor } from "@/lib/partner/run-filing";

/**
 * Nightly filing for everyone (one person in v1). Called by Vercel Cron (vercel.json) with
 * `Authorization: Bearer $CRON_SECRET`. Uses the service role key: RLS is bypassed on purpose,
 * scoped by owner_id in every query.
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
  const { data: owners } = await admin.from("entries").select("owner_id").is("collection_id", null).limit(1000);
  const ids = [...new Set((owners ?? []).map((o) => o.owner_id as string))];

  const results: Record<string, unknown> = {};
  for (const ownerId of ids) {
    try {
      results[ownerId] = await runFilingFor(admin, ownerId);
    } catch (e) {
      results[ownerId] = { error: e instanceof Error ? e.message : String(e) };
    }
  }
  return NextResponse.json({ owners: ids.length, results });
}
