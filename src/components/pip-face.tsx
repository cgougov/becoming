import { MOOD_COLORS, faceFor, type PipMood, type Shape } from "@/lib/pip";

const INK = "#1a1418";

function ShapeEl({ s }: { s: Shape }) {
  if (s.kind === "circle")
    return s.ring ? (
      <circle cx={s.cx} cy={s.cy} r={s.r} fill="none" stroke={INK} strokeWidth={s.ring} />
    ) : (
      <circle cx={s.cx} cy={s.cy} r={s.r} fill={INK} />
    );
  if (s.kind === "ellipse") return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={INK} />;
  return s.fill ? (
    <path d={s.d} fill={INK} />
  ) : (
    <path d={s.d} stroke={INK} strokeWidth={s.stroke ?? 4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  );
}

/** Pip's body + face. The body color follows the mood and fades between moods. */
export function PipFace({ mood, day, size = 64 }: { mood: PipMood; day: string; size?: number }) {
  const id = `pipshine-${size}`;
  return (
    <svg viewBox="0 0 140 140" width={size} height={size} fill="none" aria-hidden>
      <circle cx="70" cy="72" r="64" style={{ fill: MOOD_COLORS[mood], transition: "fill 600ms ease" }} />
      <circle cx="70" cy="72" r="64" fill={`url(#${id})`} />
      <defs>
        <radialGradient id={id} cx="0.36" cy="0.3" r="0.6">
          <stop offset="0" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g key={`${mood}-${day}`} className="anim-face-swap">
        {faceFor(mood, day).map((s, i) => (
          <ShapeEl key={i} s={s} />
        ))}
      </g>
      <ellipse cx="38" cy="88" rx="9" ry="4.8" fill="#fff" fillOpacity="0.42" />
      <ellipse cx="102" cy="88" rx="9" ry="4.8" fill="#fff" fillOpacity="0.42" />
    </svg>
  );
}
