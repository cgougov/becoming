"use client";

import { MicButton } from "./mic-button";

/**
 * Tap a starter or write your own (or say it). Tapping fills the box so you can still edit.
 * Used by the check-ins and onboarding so every text step works the same way.
 */
export function TapOrWrite({
  id,
  label,
  value,
  onChange,
  chips,
  placeholder,
  rows = 2,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  chips: readonly string[];
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={value === c}
            onClick={() => onChange(value === c ? "" : c)}
            className={`min-h-10 rounded-full px-4 text-[14px] font-semibold transition-colors ${value === c ? "bg-foreground text-background" : "bg-chip"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "or write your own"}
          className="flex-1 resize-none rounded-[22px] bg-chip px-4 py-3 text-[17px] font-medium leading-snug outline-none placeholder:text-muted"
        />
        <MicButton onText={(t) => onChange(value ? `${value} ${t}` : t)} />
      </div>
    </div>
  );
}
