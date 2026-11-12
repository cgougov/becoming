/** Shared page frame for the three panes: safe-area top padding, room for the bottom bar. */
export function Pane({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-base opacity-70">{subtitle}</p>}
      </header>
      {children}
    </main>
  );
}
