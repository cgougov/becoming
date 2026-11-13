"use client";

import { useEffect, useState } from "react";
import type { Mood } from "@/lib/companion";

/** Fired by the capture form after a successful keep. The companion reacts to it. */
export const KEPT_EVENT = "becoming:kept";

const REACTIONS = ["nice.", "kept.", "got it.", "love that.", "noted."];

/**
 * The companion: a circle that idles (bob, blink) and pops a one-word reaction when you
 * keep something. Ambient, not chatty (docs/PRODUCT.md). Character pass comes later.
 */
export function Companion({ mood = "idle" }: { mood?: Mood }) {
  const [reaction, setReaction] = useState<string | null>(mood === "fresh" ? "hi." : null);
  const [wiggle, setWiggle] = useState(false);

  useEffect(() => {
    // A first-ever hello fades on its own; a curious arrival says nothing, it just perks up.
    if (mood === "fresh") {
      const t = setTimeout(() => setReaction(null), 2400);
      return () => clearTimeout(t);
    }
  }, [mood]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    function onKept() {
      setReaction(REACTIONS[Math.floor(Math.random() * REACTIONS.length)]);
      setWiggle(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setReaction(null);
        setWiggle(false);
      }, 2400);
    }
    window.addEventListener(KEPT_EVENT, onKept);
    return () => {
      window.removeEventListener(KEPT_EVENT, onKept);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-6 z-10 h-16 w-16"
      style={{ bottom: "calc(5.25rem + env(safe-area-inset-bottom))" }}
    >
      <div className={`relative h-full w-full ${wiggle ? "anim-wiggle" : mood === "curious" ? "anim-bob-quick" : "anim-bob"}`}>
        <div className="absolute inset-0 rounded-full bg-accent" />
        <svg viewBox="0 0 64 64" className="relative h-full w-full" fill="none">
          <g className="anim-blink" style={{ transformOrigin: "24px 32px" }}>
            <ellipse cx="24" cy="32" rx={mood === "curious" ? 3.4 : 2.9} ry={mood === "curious" ? 4.2 : 3.4} fill="#17171c" />
          </g>
          <g className="anim-blink" style={{ transformOrigin: "40px 32px", animationDelay: "0.1s" }}>
            <ellipse cx="40" cy="32" rx={mood === "curious" ? 3.4 : 2.9} ry={mood === "curious" ? 4.2 : 3.4} fill="#17171c" />
          </g>
          <path d="M26 40.5c3 2.6 9 2.6 12 0" stroke="#17171c" strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="17" cy="38.5" rx="3.4" ry="2" fill="#fff" fillOpacity="0.5" />
          <ellipse cx="47" cy="38.5" rx="3.4" ry="2" fill="#fff" fillOpacity="0.5" />
        </svg>
        {reaction && (
          <div className="anim-pop absolute -left-14 top-1 whitespace-nowrap rounded-full bg-foreground px-3 py-1.5 text-[13px] font-bold text-background">
            {reaction}
          </div>
        )}
      </div>
    </div>
  );
}
