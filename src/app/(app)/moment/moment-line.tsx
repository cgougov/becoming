import { formatTimeInTimeZone } from "@/lib/entries/time";
import { MOMENT_ASKS, MOMENT_ENCOURAGEMENT, type MomentPhase } from "@/lib/moment";
import type { Moment } from "./today-moment";

/**
 * Quiet when upcoming, present when live, silent when passed or kept.
 * (Missing it changes nothing: there's no "missed" copy on purpose.)
 */
export function MomentLine({ moment, phase, timeZone, seed }: { moment: Moment; phase: MomentPhase; timeZone: string; seed: number }) {
  if (moment.status === "kept") {
    return <p className="text-[13px] font-semibold text-muted">today&apos;s moment · kept ♡</p>;
  }
  if (phase === "upcoming") {
    return (
      <p className="text-[13px] font-semibold text-muted">
        today&apos;s moment · {formatTimeInTimeZone(new Date(moment.at), timeZone)}
      </p>
    );
  }
  if (phase === "live") {
    const ask = MOMENT_ASKS[seed % MOMENT_ASKS.length];
    const nudge = MOMENT_ENCOURAGEMENT[seed % MOMENT_ENCOURAGEMENT.length];
    return (
      <div className="anim-rise flex items-center gap-3 rounded-card bg-accent/15 px-4 py-3">
        <span aria-hidden className="h-7 w-7 flex-none rounded-full bg-accent" />
        <div className="flex min-w-0 flex-col">
          <span className="text-[16px] font-bold leading-tight">{ask}</span>
          <span className="text-[13px] text-muted">{nudge}</span>
        </div>
      </div>
    );
  }
  return null;
}
