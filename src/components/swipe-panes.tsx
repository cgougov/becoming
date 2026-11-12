"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { adjacentPane, classifySwipe } from "@/lib/panes";

/**
 * Bonus navigation: a horizontal swipe moves to the neighbouring pane.
 * The bottom bar is the primary path; this is kept only while it doesn't
 * fight vertical scrolling (see DECISIONS 2026-11-12).
 */
export function SwipePanes({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Warm the neighbours so a swipe feels instant.
    for (const dir of ["left", "right"] as const) {
      const href = adjacentPane(pathname, dir);
      if (href) router.prefetch(href);
    }
  }, [pathname, router]);

  return (
    <div
      className="flex min-h-full flex-1 flex-col"
      onTouchStart={(e) => {
        const t = e.touches[0];
        start.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        if (!start.current) return;
        const t = e.changedTouches[0];
        const dir = classifySwipe(t.clientX - start.current.x, t.clientY - start.current.y, start.current.x, window.innerWidth);
        start.current = null;
        if (!dir) return;
        const href = adjacentPane(pathname, dir);
        if (href) router.push(href);
      }}
    >
      {children}
    </div>
  );
}
