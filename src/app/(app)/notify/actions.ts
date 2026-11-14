"use server";

import { createClient } from "@/lib/supabase/server";

export interface SubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** Remember this device so Pip can tap it on the shoulder. */
export async function savePushSubscription(sub: SubscriptionJSON): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !sub?.endpoint?.startsWith("https://") || !sub.keys?.p256dh || !sub.keys?.auth) return { ok: false };
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert({ owner_id: user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth }, { onConflict: "endpoint" });
  return { ok: !error };
}

export async function removePushSubscription(endpoint: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("push_subscriptions").delete().eq("owner_id", user.id).eq("endpoint", endpoint);
}
