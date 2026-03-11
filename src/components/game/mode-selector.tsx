"use client";

import { MODE_CONFIGS } from "@/lib/game/constants";
import { GameMode } from "@/lib/game/types";
import { cn } from "@/lib/utils";

interface ModeSelectorProps {
  value: GameMode;
  onChange: (mode: GameMode) => void;
}

const MODE_ORDER: GameMode[] = ["classic", "timed", "easy", "hard", "challenge"];

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="flex w-full gap-2 overflow-x-auto pb-1">
      {MODE_ORDER.map((mode) => {
        const config = MODE_CONFIGS[mode];
        const isActive = value === mode;

        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "min-w-28 rounded-2xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              isActive
                ? "border-transparent bg-[var(--surface-strong)] text-[var(--text-primary)] shadow-[0_12px_30px_-20px_rgba(0,0,0,0.35)]"
                : "border-[var(--border)] bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]",
            )}
            aria-pressed={isActive}
          >
            <p className="text-sm font-semibold">{config.label}</p>
            <p className="mt-0.5 text-[11px] leading-snug opacity-80">{config.description}</p>
          </button>
        );
      })}
    </div>
  );
}
