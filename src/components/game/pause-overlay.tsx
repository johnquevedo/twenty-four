"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PauseOverlayProps {
  open: boolean;
  onResume: () => void;
}

export function PauseOverlay({ open, onResume }: PauseOverlayProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-[color-mix(in_srgb,var(--bg-canvas)_70%,black)]/85 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-3xl border border-[var(--border)] bg-[var(--bg-panel)] px-6 py-5 text-center"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">Paused</p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Take your time</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Resume when you are ready to continue the run.</p>
            <Button className="mt-4" variant="primary" onClick={onResume}>
              Resume
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
