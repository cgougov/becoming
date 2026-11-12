"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PANES, paneIndexForPath } from "@/lib/panes";

const ICONS: Record<string, React.ReactNode> = {
  "/": (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  ),
  "/you": (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" />
    </svg>
  ),
  "/reflect": (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" strokeLinecap="round" />
    </svg>
  ),
};

export function BottomBar() {
  const pathname = usePathname();
  const active = paneIndexForPath(pathname);

  return (
    <nav
      aria-label="Panes"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-current/10 bg-background/90 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md justify-around">
        {PANES.map((pane, i) => (
          <li key={pane.href} className="flex-1">
            <Link
              href={pane.href}
              aria-current={i === active ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 py-2 text-[11px] transition-opacity ${
                i === active ? "opacity-100" : "opacity-40"
              }`}
            >
              {ICONS[pane.href]}
              {pane.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
