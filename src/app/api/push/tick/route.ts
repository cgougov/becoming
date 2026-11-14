import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import webpush from "web-push";
import { localDay } from "@/lib/entries/time";
import { pickMomentTime } from "@/lib/moment";
import { dueNotifications, localMinutes, pushMessage, type PushKind } from "@/lib/push";

/**
 * Every 5 minutes (Supabase pg_cron → here, see migration 20261114500000_push.sql): for each
 * person with notifications on, send whatever is due now: the moment, 8:30 morning, 10pm wind-down.
 * Guarded by `Authorization: Bearer $CRON_SECRET`. Service role, scoped by owner_id everywhere.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!url || !serviceKey || !pub || !priv) return NextResponse.json({ error: "not configured" }, { status: 500 });
  webpush.setVapidDetails("mailto:hello@christiangougov.com", pub, priv);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: subs } = await admin.from("push_subscriptions").select("id, owner_id, endpoint, p256dh, auth");
  const byOwner = new Map<string, { id: string; endpoint: string; p256dh: string; auth: string }[]>();
  for (const s of subs ?? []) {
    const list = byOwner.get(s.owner_id as string) ?? [];
    list.push({ id: s.id as string, endpoint: s.endpoint as string, p256dh: s.p256dh as string, auth: s.auth as string });
    byOwner.set(s.owner_id as string, list);
  }

  const now = new Date();
  let sent = 0;
  const errors: string[] = [];
  for (const [ownerId, devices] of byOwner) {
    try {
      sent += await tickOne(admin, ownerId, devices, now);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }
  return NextResponse.json({ people: byOwner.size, sent, errors: errors.slice(0, 5) });
}

async function tickOne(
  admin: SupabaseClient,
  ownerId: string,
  devices: { id: string; endpoint: string; p256dh: string; auth: string }[],
  now: Date,
): Promise<number> {
  const { data: profile } = await admin
    .from("profiles")
    .select("timezone, checkin_window_start, checkin_window_end")
    .eq("id", ownerId)
    .maybeSingle();
  const timeZone = (profile?.timezone as string | undefined) ?? "America/New_York";
  const day = localDay(now, timeZone);

  // Today's moment exists even if the app hasn't been opened yet today.
  let { data: moment } = await admin.from("moments").select("id, at, status").eq("owner_id", ownerId).eq("day", day).maybeSingle();
  if (!moment) {
    const at = pickMomentTime(now, timeZone, (profile?.checkin_window_start as number) ?? 600, (profile?.checkin_window_end as number) ?? 1260);
    await admin.from("moments").upsert({ owner_id: ownerId, day, at: at.toISOString() }, { onConflict: "owner_id,day", ignoreDuplicates: true });
    ({ data: moment } = await admin.from("moments").select("id, at, status").eq("owner_id", ownerId).eq("day", day).maybeSingle());
  }

  const [{ data: checks }, { data: sentRows }] = await Promise.all([
    admin.from("day_checks").select("kind").eq("owner_id", ownerId).eq("day", day),
    admin.from("push_sent").select("kind").eq("owner_id", ownerId).eq("day", day),
  ]);
  const done = new Set((checks ?? []).map((c) => c.kind as string));
  const due = dueNotifications({
    localMinutes: localMinutes(now, timeZone),
    now,
    sent: new Set((sentRows ?? []).map((r) => r.kind as PushKind)),
    morningDone: done.has("morning"),
    eveningDone: done.has("evening"),
    moment: moment ? { at: new Date(moment.at as string), status: moment.status as "scheduled" | "kept" | "missed" } : null,
  });

  let count = 0;
  for (const kind of due) {
    // Claim it first: if two ticks overlap, only one sends.
    const { data: claimed } = await admin
      .from("push_sent")
      .upsert({ owner_id: ownerId, day, kind }, { onConflict: "owner_id,day,kind", ignoreDuplicates: true })
      .select("kind");
    if (!claimed?.length) continue;
    const seed = [...day].reduce((a, ch) => a + ch.charCodeAt(0), 0);
    const payload = JSON.stringify(pushMessage(kind, seed));
    for (const d of devices) {
      try {
        await webpush.sendNotification({ endpoint: d.endpoint, keys: { p256dh: d.p256dh, auth: d.auth } }, payload, { TTL: 60 * 30 });
        count++;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        // The device unsubscribed or the app was removed: forget it.
        if (status === 404 || status === 410) await admin.from("push_subscriptions").delete().eq("id", d.id);
      }
    }
    if (kind === "moment" && moment) await admin.from("moments").update({ notified_at: now.toISOString() }).eq("id", moment.id);
  }
  return count;
}
