import type React from "react";
import { STARTER_BUCKETS } from "@/lib/buckets";

// M0/M1 placeholder home. The real widget home is designed and built in M3.
export function HomeView({ account }: { account?: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 pb-10 pt-[max(3rem,env(safe-area-inset-top))]">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Becoming</h1>
        <p className="text-base opacity-70">A running partner for your life.</p>
      </header>

      <section className="grid gap-3" aria-label="Buckets">
        {STARTER_BUCKETS.map((bucket) => (
          <div key={bucket.slug} className="rounded-2xl border border-current/10 bg-current/[.03] p-4">
            <h2 className="font-medium">{bucket.name}</h2>
            <p className="text-sm opacity-70">{bucket.description}</p>
          </div>
        ))}
      </section>

      <p className="text-sm opacity-50">Setup build. Capture arrives in M2.</p>

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
