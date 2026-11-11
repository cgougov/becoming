/**
 * Supabase public config. Read lazily so `next build` succeeds without env vars
 * (CI and preview builds), and pages can degrade gracefully when unconfigured.
 */
export function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function hasSupabaseEnv(): boolean {
  return getSupabaseEnv() !== null;
}
