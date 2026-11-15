"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FRESH_HELLO, HARD_LINE, TAP_LINES, pickReaction, type Mood } from "@/lib/companion";
import { restingMood, type PipMood } from "@/lib/pip";
import { PipFace } from "./pip-face";

/** Fired the instant you press Keep: Pip spins, says nothing yet. */
export const KEEPING_EVENT = "becoming:keeping";
/** Fired once the partner has read it (or after a short wait): Pip speaks, or goes soft if it was hard. */
export const KEPT_EVENT = "becoming:kept";
/** Fired when something kept reads as hard (the partner's tagging decides). Pip goes soft. */
export const HARD_EVENT = "becoming:hard";
/** Pip says one line now (e.g. the check-in goodbye, after the sheet has already closed). */
export const SAY_EVENT = "becoming:say";
/** Fired after a check-in: Pip rests in the mood you just gave. */
export const MOOD_EVENT = "becoming:mood";

type Motion = "bob" | "hop" | "spin" | "sway" | "breathe" | "giggle" | "skip" | "skip-twice";
const MOTION_FOR: Record<PipMood, Motion> = { calm: "bob", happy: "bob", sleepy: "breathe", soft: "sway" };

/**
 * Pip: ambient, not chatty. Switches between set faces with a bounce; the body color is the
 * mood. Hops when you come back, spins when you keep something, goes soft on hard things,
 * dozes after midnight, giggles when tapped. Never sad at you.
 */
export function Companion({ arrival = "normal", day, checked = null }: { arrival?: "fresh" | "back" | "normal"; day: string; checked?: PipMood | null }) {
  const legacyMood: Mood = arrival === "fresh" ? "fresh" : arrival === "back" ? "curious" : "idle";
  const [rest, setRest] = useState<PipMood>("calm");
  const [mood, setMood] = useState<PipMood>(arrival === "normal" ? "calm" : "happy");
  const [motion, setMotion] = useState<Motion>(arrival === "normal" ? "bob" : "hop");
  const [line, setLine] = useState<string | null>(arrival === "fresh" ? FRESH_HELLO : null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastLine = useRef<string | null>(null);

  // Resting mood depends on the local clock, so it is decided in the browser.
  useEffect(() => {
    const t = setTimeout(() => {
      const r = restingMood(new Date().getHours(), false, checked);
      setRest(r);
      setMood(r);
      setMotion(MOTION_FOR[r]);
      setLine(null);
    }, arrival === "normal" ? 0 : 2600);
    return () => clearTimeout(t);
  }, [arrival, checked]);

  useEffect(() => {
    function onMood(e: Event) {
      const m = (e as CustomEvent<{ mood: PipMood }>).detail?.mood;
      if (!m) return;
      const r = restingMood(new Date().getHours(), false, m);
      setRest(r);
      setMood(r);
      setMotion(r === "happy" ? "hop" : MOTION_FOR[r]);
    }
    window.addEventListener(MOOD_EVENT, onMood);
    return () => window.removeEventListener(MOOD_EVENT, onMood);
  }, []);

  const react = useCallback(
    (next: { mood: PipMood; motion: Motion; line: string | null; ms: number }) => {
      clearTimeout(timer.current);
      setMood(next.mood);
      setMotion(next.motion);
      setLine(next.line);
      if (next.line) lastLine.current = next.line;
      timer.current = setTimeout(() => {
        setMood(rest);
        setMotion(MOTION_FOR[rest]);
        setLine(null);
      }, next.ms);
    },
    [rest],
  );

  useEffect(() => {
    function onKeeping() {
      clearTimeout(timer.current);
      setMood("happy");
      setMotion("spin");
    }
    function onKept(e: Event) {
      const d = (e as CustomEvent<{ hasPhoto?: boolean; hasText?: boolean; keptTodayBefore?: number; moment?: boolean; tone?: string | null }>).detail ?? {};
      if (d.tone === "hard") {
        react({ mood: "soft", motion: "sway", line: HARD_LINE, ms: 7000 });
        return;
      }
      const said = pickReaction(
        {
          hasPhoto: !!d.hasPhoto,
          hasText: !!d.hasText,
          localHour: new Date().getHours(),
          keptTodayBefore: d.keptTodayBefore ?? 1,
          mood: legacyMood,
          moment: !!d.moment,
          good: d.tone === "good",
        },
        lastLine.current,
      );
      // A "yay" moves: Pip skips out and back (twice when it read as a good moment).
      react({ mood: "happy", motion: d.tone === "good" ? "skip-twice" : "skip", line: said, ms: 4500 });
    }
    function onHard() {
      react({ mood: "soft", motion: "sway", line: HARD_LINE, ms: 6000 });
    }
    function onSay(e: Event) {
      const d = (e as CustomEvent<{ line: string; soft?: boolean }>).detail;
      if (d?.line) react({ mood: d.soft ? "soft" : "happy", motion: d.soft ? "sway" : "hop", line: d.line, ms: 4000 });
    }
    window.addEventListener(SAY_EVENT, onSay);
    window.addEventListener(KEEPING_EVENT, onKeeping);
    window.addEventListener(KEPT_EVENT, onKept);
    window.addEventListener(HARD_EVENT, onHard);
    return () => {
      window.removeEventListener(KEEPING_EVENT, onKeeping);
      window.removeEventListener(KEPT_EVENT, onKept);
      window.removeEventListener(HARD_EVENT, onHard);
      window.removeEventListener(SAY_EVENT, onSay);
    };
  }, [legacyMood, react]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function tap() {
    const options = TAP_LINES.filter((l) => l !== lastLine.current);
    react({ mood: "happy", motion: "giggle", line: options[Math.floor(Math.random() * options.length)], ms: 2600 });
  }

  return (
    <div className="fixed right-5 z-10 h-16 w-16" style={{ bottom: "calc(5.25rem + env(safe-area-inset-bottom))" }}>
      <button type="button" onClick={tap} aria-label="Pip" className="relative block h-full w-full">
        <span key={motion + mood} className={`block h-full w-full anim-${motion}`}>
          <PipFace mood={mood} day={day} size={64} />
        </span>
      </button>
      {line && (
        <div
          role="status"
          className="anim-pop pointer-events-none absolute right-[4.5rem] top-1 whitespace-nowrap rounded-full bg-foreground px-3 py-1.5 text-[13px] font-bold text-background"
        >
          {line}
        </div>
      )}
    </div>
  );
}
