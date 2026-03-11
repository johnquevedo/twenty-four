"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useGameEngine } from "@/hooks/use-game-engine";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { GameMode } from "@/lib/game/types";
import { cn } from "@/lib/utils";

const DIFFICULTY_KEY = "twenty-four:simple-difficulty";
const DURATION_KEY = "twenty-four:simple-duration";

const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"] as const;
type Difficulty = (typeof DIFFICULTY_OPTIONS)[number];

const MODE_MAP: Record<Difficulty, GameMode> = {
  easy: "easy",
  medium: "classic",
  hard: "hard",
};

const QUADRANT_CLASSES = [
  "bg-red-400",
  "bg-blue-400",
  "bg-yellow-300",
  "bg-emerald-400",
];

const OPERATORS = [
  { label: "+", token: "+" },
  { label: "-", token: "-" },
  { label: "×", token: "*" },
  { label: "÷", token: "/" },
  { label: "(", token: "(" },
  { label: ")", token: ")" },
] as const;

function isCardUsed(hand: number[], index: number, usedCounts: Map<number, number>) {
  const value = hand[index];
  const usedCount = usedCounts.get(value) ?? 0;

  let seen = 0;
  for (let i = 0; i <= index; i += 1) {
    if (hand[i] === value) {
      seen += 1;
    }
  }

  return seen <= usedCount;
}

function getQuarterNumberSize(value: number) {
  return value >= 10 ? "clamp(3.2rem, 8.4vmin, 5.4rem)" : "clamp(3.7rem, 9.8vmin, 6.2rem)";
}

function formatExpression(expression: string) {
  const trimmed = expression.trim();
  if (!trimmed) {
    return "\u00A0";
  }

  return trimmed
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/\s+/g, " ");
}

function formatTime(seconds: number | null) {
  if (seconds === null) {
    return "--:--";
  }

  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const remaining = (safe % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function estimateWorldPercentile(correctCount: number, durationSeconds: number, difficulty: Difficulty) {
  const minutes = Math.max(0.25, durationSeconds / 60);
  const solvesPerMinute = correctCount / minutes;
  const difficultyBonus = difficulty === "hard" ? 1.25 : difficulty === "medium" ? 0.65 : 0;
  const adjustedRate = solvesPerMinute + difficultyBonus;

  const percentile = Math.round(
    100 / (1 + Math.exp(-1.15 * (adjustedRate - 3.8))),
  );

  return Math.min(99, Math.max(1, percentile));
}

function ordinal(percentile: number) {
  const tens = percentile % 10;
  const hundreds = percentile % 100;
  if (hundreds >= 11 && hundreds <= 13) {
    return `${percentile}th`;
  }
  if (tens === 1) return `${percentile}st`;
  if (tens === 2) return `${percentile}nd`;
  if (tens === 3) return `${percentile}rd`;
  return `${percentile}th`;
}

interface SpeedRunBoardProps {
  difficulty: Difficulty;
  durationSeconds: number;
  onBackToSetup: () => void;
}

function SpeedRunBoard({ difficulty, durationSeconds, onBackToSetup }: SpeedRunBoardProps) {
  const {
    session,
    usedNumberCounts,
    actions: {
      appendToken,
      appendKeyboardDigit,
      backspace,
      clearExpression,
      submit,
      nextRound,
      restart,
      dismissFeedback,
    },
  } = useGameEngine({
    mode: MODE_MAP[difficulty],
    highScore: 0,
    onHighScore: () => {
      // score is intentionally not surfaced in this simplified speed-run UI.
    },
    sessionSecondsOverride: durationSeconds,
    autoAdvanceOnSolve: true,
  });

  const worldPercentile = estimateWorldPercentile(
    session.correctCount,
    durationSeconds,
    difficulty,
  );

  const lastFeedbackId = useRef<number | null>(null);
  useEffect(() => {
    if (
      !session.feedback ||
      session.feedback.id === lastFeedbackId.current ||
      session.status === "over"
    ) {
      return;
    }

    lastFeedbackId.current = session.feedback.id;

    const timeout = window.setTimeout(() => {
      dismissFeedback();
    }, 2000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [dismissFeedback, session.feedback, session.status]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const isTextInput =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isTextInput) {
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        backspace();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        submit();
        return;
      }

      if (/^\d$/.test(event.key)) {
        event.preventDefault();
        appendKeyboardDigit(event.key);
        return;
      }

      if (["+", "-", "*", "/", "(", ")"].includes(event.key)) {
        event.preventDefault();
        appendToken(event.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [appendKeyboardDigit, appendToken, backspace, submit]);

  return (
    <main className="mx-auto h-[100dvh] w-full max-w-[1100px] overflow-hidden px-2 py-2 sm:px-3 sm:py-3">
      <section className="grid h-full grid-rows-[auto_auto_minmax(0,1fr)_auto_auto_auto] gap-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold capitalize text-white">
              {difficulty}
            </span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {durationSeconds}s run
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">{formatTime(session.timeLeft)}</span>
            <button
              type="button"
              onClick={onBackToSetup}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              Setup
            </button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[34rem] px-2 py-1 text-center font-mono text-lg text-slate-700 sm:text-xl">
          {formatExpression(session.expression)}
        </div>

        <motion.div
          key={`${session.hand.join("-")}-${session.round}`}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex min-h-0 items-center justify-center overflow-hidden py-1"
        >
          <div
            className="relative aspect-square overflow-hidden rounded-full border-4 border-slate-100 shadow-[0_20px_48px_-24px_rgba(15,23,42,0.45)]"
            style={{
              width: "min(88vw, calc(100dvh - 25.5rem), 40rem)",
              height: "min(88vw, calc(100dvh - 25.5rem), 40rem)",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          >
            <div className="grid h-full w-full grid-cols-2 grid-rows-2">
              {session.hand.map((value, index) => {
                const used = isCardUsed(session.hand, index, usedNumberCounts);
                return (
                  <button
                    key={`${value}-${index}`}
                    type="button"
                    onClick={() => appendToken(`${value}`)}
                    disabled={used}
                    style={{
                      fontSize: getQuarterNumberSize(value),
                      lineHeight: 0.88,
                      fontFamily: "\"Arial\", \"Helvetica Neue\", Helvetica, sans-serif",
                      fontWeight: 700,
                    }}
                    className={cn(
                      "flex items-center justify-center text-slate-900 transition",
                      QUADRANT_CLASSES[index],
                      used ? "opacity-30" : "hover:brightness-95 active:scale-[0.99]",
                    )}
                    aria-label={`Use number ${value}`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div className="mx-auto grid w-fit grid-cols-3 gap-1.5 text-[11px] sm:text-xs">
          <button
            type="button"
            onClick={submit}
            className="min-w-[3.6rem] rounded-lg bg-slate-900 px-2 py-1.5 font-semibold text-white"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={clearExpression}
            className="min-w-[3.6rem] rounded-lg bg-slate-200 px-2 py-1.5 font-semibold text-slate-900"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => (session.status === "over" ? restart() : nextRound())}
            className="min-w-[3.6rem] rounded-lg bg-slate-200 px-2 py-1.5 font-semibold text-slate-900"
          >
            {session.status === "over" ? "Restart" : "New"}
          </button>
        </div>

        <div className="border-t border-slate-200 pt-2.5">
          <p className="mb-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Operations</p>
          <div className="mx-auto grid w-fit grid-cols-6 gap-1.5">
            {OPERATORS.map((operator) => (
              <button
                key={operator.label}
                type="button"
                onClick={() => appendToken(operator.token)}
                className="h-9 w-10 rounded-xl bg-slate-100 text-xl font-semibold text-slate-900 transition hover:bg-slate-200"
                aria-label={`Insert ${operator.label}`}
              >
                {operator.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-10">
          <AnimatePresence mode="wait">
            {session.status === "over" ? (
              <motion.div
                key="run-complete"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-100 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700">Run complete.</p>
                  <p className="text-xs text-slate-600">
                    {session.correctCount} solved · {ordinal(worldPercentile)} percentile worldwide (estimated)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={restart}
                    className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white"
                  >
                    Restart
                  </button>
                  <button
                    type="button"
                    onClick={onBackToSetup}
                    className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700"
                  >
                    Setup
                  </button>
                </div>
              </motion.div>
            ) : session.feedback ? (
              <motion.div
                key={session.feedback.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs sm:text-sm",
                  session.feedback.type === "success" && "bg-emerald-100 text-emerald-900",
                  session.feedback.type === "error" && "bg-rose-100 text-rose-900",
                  session.feedback.type === "info" && "bg-sky-100 text-sky-900",
                )}
              >
                <p className="font-medium">{session.feedback.message}</p>
                {session.feedback.detail ? <p className="mt-0.5 text-[11px] opacity-80">{session.feedback.detail}</p> : null}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

export function GameApp() {
  const [difficulty, setDifficulty] = usePersistentState<Difficulty>(DIFFICULTY_KEY, "medium");
  const [durationSeconds, setDurationSeconds] = usePersistentState<number>(DURATION_KEY, 60);
  const [durationInput, setDurationInput] = useState(String(durationSeconds));
  const [setupError, setSetupError] = useState<string | null>(null);
  const [runKey, setRunKey] = useState<number | null>(null);

  useEffect(() => {
    setDurationInput(String(durationSeconds));
  }, [durationSeconds]);

  const startRun = () => {
    const parsed = Number.parseInt(durationInput.trim(), 10);
    if (!Number.isFinite(parsed) || parsed < 5) {
      setSetupError("Enter a valid time in seconds (minimum 5).");
      return;
    }

    setSetupError(null);
    setDurationSeconds(parsed);
    setRunKey(Date.now());
  };

  if (runKey !== null) {
    return (
      <SpeedRunBoard
        key={`${difficulty}-${durationSeconds}-${runKey}`}
        difficulty={difficulty}
        durationSeconds={durationSeconds}
        onBackToSetup={() => setRunKey(null)}
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-4 py-8">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <h1 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">24 Game</h1>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDifficulty(option)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition",
                  difficulty === option
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="run-seconds" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Time (Seconds)
          </label>
          <input
            id="run-seconds"
            type="number"
            min={5}
            step={1}
            value={durationInput}
            onChange={(event) => setDurationInput(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none focus:border-slate-500"
            placeholder="e.g. 75"
          />
          {setupError ? <p className="mt-2 text-sm text-rose-600">{setupError}</p> : null}
        </div>

        <button
          type="button"
          onClick={startRun}
          className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Start Run
        </button>
      </section>
    </main>
  );
}
