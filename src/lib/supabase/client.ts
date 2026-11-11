"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/** Browser-side client. Only needed for client components (e.g. photo upload in M2). */
export function createClient() {
  const env = getSupabaseEnv();
  if (!env) throw new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).");
  return createBrowserClient(env.url, env.anonKey);
}
