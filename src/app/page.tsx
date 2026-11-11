import { STARTER_BUCKETS } from "@/lib/buckets";

// M0 placeholder home. The real widget home is designed and built in M3.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 pb-10 pt-[max(3rem,env(safe-area-inset-top))]">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Becoming</h1>
        <p className="text-base opacity-70">A running partner for your life.</p>
      </header>

      <section className="grid gap-3" aria-label="Buckets">
        {STARTER_BUCKETS.map((bucket) => (
          <div
            key={bucket.slug}
            className="rounded-2xl border border-current/10 bg-current/[.03] p-4"
          >
            <h2 className="font-medium">{bucket.name}</h2>
            <p className="text-sm opacity-70">{bucket.description}</p>
          </div>
        ))}
      </section>

      <p className="text-sm opacity-50">Setup build. Capture arrives in M2.</p>
    </main>
  );
}
