/**
 * Which paths are reachable without a session. Pure so it can be unit-tested
 * independently of the proxy.
 */
// The schedulers ("/api/partner/tag" nightly via Vercel Cron, "/api/push/tick" every 5 min via
// Supabase pg_cron) have no session and check their own CRON_SECRET bearer token, so the session
// gate must not bounce them to /login. "/sw.js" is the service worker for notifications.
const PUBLIC_PREFIXES = ["/login", "/auth/", "/manifest.webmanifest", "/icons/", "/api/partner/tag", "/api/push/tick", "/sw.js"] as const;

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => (p.endsWith("/") ? pathname.startsWith(p) : pathname === p));
}

/**
 * Only allow same-origin relative redirects after login, so a crafted link
 * can't bounce a signed-in user to another site.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}

export function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  // Deliberately loose: Supabase validates for real. This just catches empties and typos.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

/** The emailed sign-in code: digits only, 6–10 long (Supabase's length is configurable). */
export function normalizeOtp(raw: string): string | null {
  const code = raw.replace(/\D/g, "");
  return code.length >= 6 && code.length <= 10 ? code : null;
}
