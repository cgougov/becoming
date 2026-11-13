/** Shared page frame for the three panes: safe-area top padding, room for the bottom bar. */
export function Pane({
  title,
  subtitle,
  aside,
  big = false,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  aside?: React.ReactNode;
  /** Large heading (Yours, Look back, Start); small for Keep where the box is the hero. */
  big?: boolean;
  children: React.ReactNode;
}) {
  return (
    <main className="anim-pane mx-auto flex w-full max-w-md flex-1 flex-col gap-7 px-6 pt-[max(3.5rem,env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))]">
      <header className="flex flex-col gap-1.5">
        <div className="flex items-end justify-between gap-4">
          <h1 className={big ? "text-[26px] font-bold leading-tight tracking-[-0.02em]" : "text-[15px] font-bold tracking-tight"}>{title}</h1>
          {aside && <div className="shrink-0 text-[13px] font-medium text-muted">{aside}</div>}
        </div>
        {subtitle && <p className="text-[14px] text-muted">{subtitle}</p>}
      </header>
      {children}
    </main>
  );
}
