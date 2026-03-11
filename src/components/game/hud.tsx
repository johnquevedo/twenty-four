import { Pause, Play, Timer, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameSession, ModeConfig } from "@/lib/game/types";
import { formatSeconds } from "@/lib/utils";

interface HudProps {
  session: GameSession;
  config: ModeConfig;
  highScore: number;
  onPause: () => void;
  onResume: () => void;
}

export function Hud({ session, config, highScore, onPause, onResume }: HudProps) {
  const timed = config.timed;

  return (
    <section className="grid gap-3 rounded-3xl border border-[var(--border)] bg-[var(--bg-panel)] p-4 sm:grid-cols-2 lg:grid-cols-5">
      <div className="rounded-2xl bg-[var(--surface-soft)] px-3 py-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Score</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">{session.score}</p>
      </div>
      <div className="rounded-2xl bg-[var(--surface-soft)] px-3 py-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Streak</p>
        <p className="mt-1 flex items-center gap-1 text-2xl font-semibold text-[var(--text-primary)]">
          <Zap className="size-4 text-[var(--accent)]" />
          {session.streak}
        </p>
      </div>
      <div className="rounded-2xl bg-[var(--surface-soft)] px-3 py-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">High</p>
        <p className="mt-1 flex items-center gap-1 text-2xl font-semibold text-[var(--text-primary)]">
          <Trophy className="size-4 text-[var(--accent)]" />
          {highScore}
        </p>
      </div>
      <div className="rounded-2xl bg-[var(--surface-soft)] px-3 py-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Round</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">#{session.round}</p>
      </div>
      <div className="rounded-2xl bg-[var(--surface-soft)] px-3 py-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Timer</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-2xl font-semibold text-[var(--text-primary)]">
            <Timer className="size-4 text-[var(--accent)]" />
            {timed ? formatSeconds(session.timeLeft) : "Untimed"}
          </p>
          {timed ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={session.status === "paused" ? onResume : onPause}
              aria-label={session.status === "paused" ? "Resume game" : "Pause game"}
            >
              {session.status === "paused" ? (
                <>
                  <Play className="size-4" /> Resume
                </>
              ) : (
                <>
                  <Pause className="size-4" /> Pause
                </>
              )}
            </Button>
          ) : null}
        </div>
        {config.roundSeconds ? (
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Round clock: {formatSeconds(session.roundTimeLeft)}
          </p>
        ) : null}
        {session.mistakesLeft !== null ? (
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Mistakes left: <span className="font-semibold text-[var(--text-primary)]">{session.mistakesLeft}</span>
          </p>
        ) : null}
      </div>
    </section>
  );
}
