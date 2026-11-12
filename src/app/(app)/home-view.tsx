import type React from "react";
import { Pane } from "@/components/pane";

/** Capture pane frame. Slots are filled with request-time data inside Suspense. */
export function HomeView({ capture, today }: { capture?: React.ReactNode; today?: React.ReactNode }) {
  return (
    <Pane title="Becoming" subtitle="A running partner for your life.">
      {capture ?? <p className="text-sm opacity-50">Sign in to start capturing.</p>}
      {today}
    </Pane>
  );
}
