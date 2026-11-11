/**
 * Which paths are reachable without a session. Pure so it can be unit-tested
 * independently of the proxy.
 */
const PUBLIC_PREFIXES = ["/login", "/auth/", "/manifest.webmanifest", "/icons/"] as const;

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
