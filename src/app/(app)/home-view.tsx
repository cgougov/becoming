import type React from "react";
import { Pane } from "@/components/pane";

/** Keep pane frame. Slots are filled with request-time data inside Suspense. */
export function HomeView({ capture, today, day }: { capture?: React.ReactNode; today?: React.ReactNode; day?: string }) {
  return (
    <Pane title="Becoming" aside={day}>
      {capture ?? <p className="text-sm text-muted">Sign in to start keeping things.</p>}
      {today}
    </Pane>
  );
}
