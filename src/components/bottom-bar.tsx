"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PANES, paneIndexForPath } from "@/lib/panes";

const ICONS: Record<string, React.ReactNode> = {
  "/": (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  ),
  "/you": (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="2.5" />
      <rect x="13" y="4" width="7" height="7" rx="2.5" />
      <rect x="4" y="13" width="7" height="7" rx="2.5" />
      <rect x="13" y="13" width="7" height="7" rx="2.5" />
    </svg>
  ),
  "/reflect": (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" strokeLinecap="round" />
    </svg>
  ),
};

/** Thin icon row; the active pane gets an accent dot. Labels are for screen readers only. */
export function BottomBar() {
  const pathname = usePathname();
  const active = paneIndexForPath(pathname);

  return (
    <nav
      aria-label="Panes"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-foreground/[0.06] bg-background/60 backdrop-blur-xl backdrop-saturate-150"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex h-[68px] max-w-md items-center justify-around">
        {PANES.map((pane, i) => {
          const on = i === active;
          return (
            <li key={pane.href}>
              <Link
                href={pane.href}
                aria-label={pane.label}
                aria-current={on ? "page" : undefined}
                className={`flex h-11 w-14 flex-col items-center justify-center gap-[5px] transition-colors ${on ? "text-foreground" : "text-muted"}`}
              >
                {ICONS[pane.href]}
                <span className={`h-[5px] w-[5px] rounded-full ${on ? "bg-accent" : "bg-transparent"}`} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
