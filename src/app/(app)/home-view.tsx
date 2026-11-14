import type React from "react";
import { Pane } from "@/components/pane";

/** Keep pane frame. Slots are filled with request-time data inside Suspense. */
export function HomeView({
  moodBar,
  checkin,
  nudge,
  moment,
  intention,
  capture,
  today,
  day,
}: {
  moodBar?: React.ReactNode;
  checkin?: React.ReactNode;
  nudge?: React.ReactNode;
  moment?: React.ReactNode;
  intention?: React.ReactNode;
  capture?: React.ReactNode;
  today?: React.ReactNode;
  day?: string;
}) {
  return (
    <Pane title="Becoming" aside={day}>
      {moodBar}
      {checkin}
      {nudge}
      {moment}
      {intention}
      {capture ?? <p className="text-sm text-muted">Sign in to start keeping things.</p>}
      {today}
    </Pane>
  );
}
