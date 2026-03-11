"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberBoardProps {
  hand: number[];
  usedNumberCounts: Map<number, number>;
  disabled?: boolean;
  onInsert: (value: number) => void;
}

function isCardUsed(hand: number[], index: number, usedCounts: Map<number, number>): boolean {
  const value = hand[index];
  const usedCount = usedCounts.get(value) ?? 0;

  let occurrence = 0;
  for (let i = 0; i <= index; i += 1) {
    if (hand[i] === value) {
      occurrence += 1;
    }
  }

  return occurrence <= usedCount;
}

export function NumberBoard({ hand, usedNumberCounts, disabled = false, onInsert }: NumberBoardProps) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Current numbers">
      {hand.map((value, index) => {
        const used = isCardUsed(hand, index, usedNumberCounts);

        return (
          <motion.button
            key={`${value}-${index}`}
            type="button"
            layout
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
            whileHover={disabled ? undefined : { y: -2, scale: 1.01 }}
            whileTap={disabled ? undefined : { scale: 0.98 }}
            onClick={() => onInsert(value)}
            disabled={disabled}
            className={cn(
              "group relative flex h-24 items-center justify-center overflow-hidden rounded-2xl border text-4xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              used
                ? "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]"
                : "border-[var(--border-strong)] bg-[var(--surface-strong)] text-[var(--text-primary)] shadow-[0_25px_45px_-30px_rgba(0,0,0,0.45)]",
            )}
            aria-label={`Insert number ${value}`}
          >
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--number-glow),transparent_55%)] opacity-80" />
            <span className="relative">{value}</span>
          </motion.button>
        );
      })}
    </section>
  );
}
