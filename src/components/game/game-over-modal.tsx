import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { GameSession } from "@/lib/game/types";

interface GameOverModalProps {
  open: boolean;
  session: GameSession;
  highScore: number;
  onRestart: () => void;
  onClose: () => void;
}

export function GameOverModal({ open, session, highScore, onRestart, onClose }: GameOverModalProps) {
  const accuracy =
    session.correctCount + session.wrongCount > 0
      ? Math.round((session.correctCount / (session.correctCount + session.wrongCount)) * 100)
      : 0;

  return (
    <Modal open={open} onClose={onClose} title="Run Summary" widthClassName="max-w-lg">
      <div className="space-y-4 text-sm text-[var(--text-secondary)]">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Final Score</p>
          <p className="mt-1 text-4xl font-semibold text-[var(--text-primary)]">{session.score}</p>
          <p className="mt-1 text-xs">High score: {highScore}</p>
        </section>

        <section className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-[var(--surface-soft)] p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Correct</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{session.correctCount}</p>
          </div>
          <div className="rounded-xl bg-[var(--surface-soft)] p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Misses</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{session.wrongCount}</p>
          </div>
          <div className="rounded-xl bg-[var(--surface-soft)] p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Best Streak</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{session.bestStreak}</p>
          </div>
          <div className="rounded-xl bg-[var(--surface-soft)] p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Accuracy</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{accuracy}%</p>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={onRestart}>
            Play Again
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Keep Browsing
          </Button>
        </div>
      </div>
    </Modal>
  );
}
