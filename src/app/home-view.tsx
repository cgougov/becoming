import type React from "react";
import { STARTER_BUCKETS } from "@/lib/buckets";

/**
 * Home layout. Slots are filled by the page with request-time data inside
 * Suspense boundaries; with no slots it renders the static placeholder (and
 * is what the unit test exercises).
 */
export function HomeView({
  capture,
  today,
  buckets,
  account,
}: {
  capture?: React.ReactNode;
  today?: React.ReactNode;
  buckets?: React.ReactNode;
  account?: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 pb-10 pt-[max(3rem,env(safe-area-inset-top))]">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Becoming</h1>
        <p className="text-base opacity-70">A running partner for your life.</p>
      </header>

      {capture}
      {today}

      {buckets ?? (
        <section className="grid gap-3" aria-label="Buckets">
          {STARTER_BUCKETS.map((bucket) => (
            <div key={bucket.slug} className="rounded-2xl border border-current/10 bg-current/[.03] p-4">
              <h2 className="font-medium">{bucket.name}</h2>
              <p className="text-sm opacity-70">{bucket.description}</p>
            </div>
          ))}
        </section>
      )}

      {account}
    </main>
  );
}

export function AccountFooter({ email }: { email?: string | null }) {
  if (!email) return null;
  return (
    <form action="/auth/signout" method="post" className="mt-auto flex items-center justify-between text-sm opacity-60">
      <span>{email}</span>
      <button type="submit" className="underline">
        Sign out
      </button>
    </form>
  );
}
