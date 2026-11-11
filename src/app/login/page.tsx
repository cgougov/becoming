import { Suspense } from "react";
import { safeNextPath } from "@/lib/auth/routes";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { LoginForm } from "./login-form";

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 pb-10 pt-[max(3rem,env(safe-area-inset-top))]">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Becoming</h1>
        <p className="text-base opacity-70">Sign in with a link. No password to remember.</p>
      </header>

      <Suspense>
        <LoginBody searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function LoginBody({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <>
      {error && (
        <p className="rounded-xl border border-red-600/30 bg-red-600/5 p-3 text-sm" role="alert">
          That link didn&apos;t work (it may have expired). Request a new one below.
        </p>
      )}

      {hasSupabaseEnv() ? (
        <LoginForm next={next} />
      ) : (
        <p className="text-sm opacity-70">
          Sign-in isn&apos;t configured in this environment yet (missing Supabase env vars).
        </p>
      )}
    </>
  );
}
