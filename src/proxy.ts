import { NextResponse, type NextRequest } from "next/server";
import { isPublicPath } from "@/lib/auth/routes";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  // Unconfigured (no Supabase env): let everything through so the shell still renders.
  if (!hasSupabaseEnv()) return NextResponse.next({ request });

  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Skip Next internals and static files (anything with a file extension).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|webmanifest)$).*)"],
};
