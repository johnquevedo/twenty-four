"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MODE_CONFIGS, TARGET_VALUE } from "@/lib/game/constants";
import { generateRound } from "@/lib/game/generator";
import { getUsedNumberCounts, validateExpressionSubmission } from "@/lib/game/validator";
import { FeedbackMessage, GameMode, GameSession } from "@/lib/game/types";
import { clamp } from "@/lib/utils";

interface UseGameEngineOptions {
  mode: GameMode;
  highScore: number;
  onHighScore: (nextHighScore: number) => void;
  sessionSecondsOverride?: number | null;
  autoAdvanceOnSolve?: boolean;
}

interface NextRoundOptions {
  skipped?: boolean;
  feedback?: FeedbackMessage | null;
  preserveScore?: boolean;
}

const AUTO_ADVANCE_DELAY_MS = 1050;
const TIMED_SKIP_PENALTY = 2;
const TIMED_MISS_PENALTY = 1;

function buildFeedback(type: FeedbackMessage["type"], message: string, detail?: string): FeedbackMessage {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    type,
    message,
    detail,
  };
}

function createSession(mode: GameMode, sessionSecondsOverride?: number | null): GameSession {
  const config = MODE_CONFIGS[mode];
  const firstRound = generateRound(mode);

  return {
    mode,
    status: "playing",
    hand: firstRound.hand,
    solution: firstRound.solution,
    solvable: firstRound.solvable,
    expression: "",
    score: 0,
    streak: 0,
    bestStreak: 0,
    round: 1,
    correctCount: 0,
    wrongCount: 0,
    timeLeft:
      sessionSecondsOverride !== undefined
        ? sessionSecondsOverride
        : config.sessionSeconds,
    roundTimeLeft: config.roundSeconds,
    mistakesLeft: config.mistakesAllowed,
    showSolution: false,
    feedback: null,
    lastResult: null,
  };
}

function appendInputToken(baseExpression: string, token: string): string {
  const base = baseExpression.trimEnd();
  const lastChar = base.slice(-1);
  const openParens = (base.match(/\(/g) ?? []).length;
  const closedParens = (base.match(/\)/g) ?? []).length;
  const isNumber = /^\d+$/.test(token);
  const isOperator = /^[+\-*/]$/.test(token);

  if (isNumber) {
    if (!lastChar) {
      return `${token} `;
    }

    if (/\d|\)/.test(lastChar)) {
      return baseExpression;
    }

    if (lastChar === "(") {
      return `${base}${token} `;
    }

    return `${base} ${token} `;
  }

  if (isOperator) {
    if (!lastChar || /[+\-*/(]/.test(lastChar)) {
      return baseExpression;
    }
    return `${base} ${token} `;
  }

  if (token === "(") {
    if (!lastChar) {
      return "(";
    }

    if (/\d|\)/.test(lastChar)) {
      return baseExpression;
    }

    return `${base} (`;
  }

  if (token === ")") {
    if (!lastChar || !/[\d)]/.test(lastChar)) {
      return baseExpression;
    }

    if (openParens > closedParens) {
      return `${base})`;
    }

    return `(${base})`;
  }

  return `${baseExpression}${token}`;
}

export function useGameEngine({
  mode,
  highScore,
  onHighScore,
  sessionSecondsOverride,
  autoAdvanceOnSolve,
}: UseGameEngineOptions) {
  const [session, setSession] = useState<GameSession>(() => createSession(mode, sessionSecondsOverride));
  const sessionRef = useRef(session);
  const autoAdvanceRef = useRef<number | null>(null);
  const hasInitializedModeRef = useRef(false);
  const keyboardNumberActiveRef = useRef(false);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const config = MODE_CONFIGS[mode];
  const shouldAutoAdvanceOnSolve = autoAdvanceOnSolve ?? config.autoAdvanceOnSolve;

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceRef.current !== null) {
      window.clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
  }, []);

  const moveToNextRound = useCallback(
    (current: GameSession, options: NextRoundOptions = {}) => {
      const nextRound = generateRound(mode);
      const score = options.preserveScore ? current.score : clamp(current.score, 0, Number.MAX_SAFE_INTEGER);

      return {
        ...current,
        hand: nextRound.hand,
        solution: nextRound.solution,
        solvable: nextRound.solvable,
        expression: "",
        showSolution: false,
        feedback: options.feedback ?? null,
        round: current.round + 1,
        score,
        roundTimeLeft: config.roundSeconds,
        lastResult: options.skipped ? "skipped" : null,
      } satisfies GameSession;
    },
    [config.roundSeconds, mode],
  );

  const finishGame = useCallback((current: GameSession, message: string, detail?: string): GameSession => {
    return {
      ...current,
      status: "over",
      expression: "",
      roundTimeLeft: current.roundTimeLeft,
      feedback: buildFeedback("info", message, detail),
    };
  }, []);

  const applyMiss = useCallback(
    (
      current: GameSession,
      message: string,
      detail: string,
      reason: GameSession["lastResult"],
      options?: { andAdvanceRound?: boolean },
    ): GameSession => {
      const withPenalty = MODE_CONFIGS[current.mode].timed
        ? Math.max(0, current.score - TIMED_MISS_PENALTY)
        : current.score;

      let mistakesLeft = current.mistakesLeft;
      if (mistakesLeft !== null) {
        mistakesLeft -= 1;
      }

      const baseState: GameSession = {
        ...current,
        score: withPenalty,
        streak: 0,
        wrongCount: current.wrongCount + 1,
        mistakesLeft,
        feedback: buildFeedback("error", message, detail),
        lastResult: reason,
      };

      if (mistakesLeft !== null && mistakesLeft <= 0) {
        return finishGame(baseState, "Challenge ended", "No mistakes remaining.");
      }

      if (options?.andAdvanceRound) {
        return moveToNextRound(baseState, {
          feedback: buildFeedback("error", message, detail),
        });
      }

      return baseState;
    },
    [finishGame, moveToNextRound],
  );

  const restart = useCallback(() => {
    clearAutoAdvance();
    setSession(createSession(mode, sessionSecondsOverride));
  }, [clearAutoAdvance, mode, sessionSecondsOverride]);

  useEffect(() => {
    if (!hasInitializedModeRef.current) {
      hasInitializedModeRef.current = true;
      return;
    }

    const resetTimer = window.setTimeout(() => {
      restart();
    }, 0);

    return () => {
      window.clearTimeout(resetTimer);
    };
  }, [mode, restart, sessionSecondsOverride]);

  useEffect(() => {
    if (session.score > highScore) {
      onHighScore(session.score);
    }
  }, [highScore, onHighScore, session.score]);

  const hasSessionTimer = session.timeLeft !== null;

  useEffect(() => {
    if (!hasSessionTimer) {
      return;
    }

    const timer = window.setInterval(() => {
      const current = sessionRef.current;
      if (current.status !== "playing" || current.timeLeft === null) {
        return;
      }

      if (current.timeLeft <= 1) {
        setSession(finishGame({ ...current, timeLeft: 0 }, "Time is up", "Check your summary and run it back."));
        clearAutoAdvance();
        return;
      }

      setSession({ ...current, timeLeft: current.timeLeft - 1 });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [clearAutoAdvance, finishGame, hasSessionTimer]);

  useEffect(() => {
    if (!config.roundSeconds) {
      return;
    }

    const timer = window.setInterval(() => {
      const current = sessionRef.current;
      if (current.status !== "playing" || current.roundTimeLeft === null) {
        return;
      }

      if (current.roundTimeLeft <= 1) {
        setSession(
          applyMiss(
            {
              ...current,
              roundTimeLeft: 0,
            },
            "Round timed out",
            "A new hand has been dealt.",
            "timeout",
            { andAdvanceRound: true },
          ),
        );
        return;
      }

      setSession({ ...current, roundTimeLeft: current.roundTimeLeft - 1 });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [applyMiss, config.roundSeconds]);

  useEffect(() => {
    return () => {
      clearAutoAdvance();
    };
  }, [clearAutoAdvance]);

  const setExpression = useCallback((value: string) => {
    const current = sessionRef.current;
    if (current.status !== "playing") {
      return;
    }

    keyboardNumberActiveRef.current = false;
    setSession({ ...current, expression: value });
  }, []);

  const appendToken = useCallback((token: string) => {
    const current = sessionRef.current;
    if (current.status !== "playing") {
      return;
    }

    keyboardNumberActiveRef.current = false;
    setSession({
      ...current,
      expression: appendInputToken(current.expression, token),
    });
  }, []);

  const appendKeyboardDigit = useCallback((digit: string) => {
    const current = sessionRef.current;
    if (current.status !== "playing") {
      return;
    }

    const base = current.expression.trimEnd();
    const lastChar = base.slice(-1);
    const canStartNumber = !lastChar || /[+\-*/(]/.test(lastChar);

    if (keyboardNumberActiveRef.current) {
      if (/\d$/.test(base)) {
        setSession({
          ...current,
          expression: `${base}${digit}`,
        });
      }
      return;
    }

    if (!canStartNumber) {
      return;
    }

    keyboardNumberActiveRef.current = true;

    const nextExpression = !base
      ? digit
      : lastChar === "("
        ? `${base}${digit}`
        : `${base} ${digit}`;

    setSession({
      ...current,
      expression: nextExpression,
    });
  }, []);

  const backspace = useCallback(() => {
    const current = sessionRef.current;
    if (current.status !== "playing") {
      return;
    }

    const nextExpression = current.expression.slice(0, -1);
    const trimmed = nextExpression.trimEnd();
    keyboardNumberActiveRef.current =
      trimmed.length > 0 &&
      /\d$/.test(trimmed) &&
      !nextExpression.endsWith(" ");

    setSession({
      ...current,
      expression: nextExpression,
    });
  }, []);

  const clearExpression = useCallback(() => {
    const current = sessionRef.current;
    if (current.status !== "playing") {
      return;
    }

    setSession({
      ...current,
      expression: "",
    });
    keyboardNumberActiveRef.current = false;
  }, []);

  const nextRound = useCallback(
    (options?: { skipped?: boolean }) => {
      const current = sessionRef.current;
      if (current.status === "over") {
        return;
      }

      clearAutoAdvance();

      const isSkip = Boolean(options?.skipped);
      const modeConfig = MODE_CONFIGS[current.mode];

      let updated = current;
      if (isSkip) {
        const score = modeConfig.timed
          ? Math.max(0, current.score - TIMED_SKIP_PENALTY)
          : current.score;

        let mistakesLeft = current.mistakesLeft;
        if (mistakesLeft !== null) {
          mistakesLeft -= 1;
        }

        updated = {
          ...current,
          score,
          streak: 0,
          wrongCount: current.wrongCount + 1,
          mistakesLeft,
          feedback: buildFeedback("info", "Skipped round", "Fresh numbers ready."),
          lastResult: "skipped",
        };

        if (mistakesLeft !== null && mistakesLeft <= 0) {
          setSession(finishGame(updated, "Challenge ended", "No mistakes remaining."));
          return;
        }
      }

      setSession(
        moveToNextRound(updated, {
          skipped: isSkip,
          feedback: isSkip ? buildFeedback("info", "New round", "Keep the streak alive.") : null,
        }),
      );
      keyboardNumberActiveRef.current = false;
    },
    [clearAutoAdvance, finishGame, moveToNextRound],
  );

  const revealSolution = useCallback(() => {
    const current = sessionRef.current;
    if (current.status === "over") {
      return;
    }

    const detail = current.solvable
      ? current.solution ?? "A solution exists, but could not be reconstructed."
      : "This hand has no solution to reach 24.";

    setSession({
      ...current,
      showSolution: true,
      feedback: buildFeedback("info", "Solution revealed", detail),
    });
    keyboardNumberActiveRef.current = false;
  }, []);

  const submit = useCallback(() => {
    const current = sessionRef.current;
    if (current.status !== "playing") {
      return;
    }

    clearAutoAdvance();

    const result = validateExpressionSubmission(current.expression, current.hand);
    if (!result.ok) {
      setSession(
        applyMiss(
          current,
          result.error ?? "Incorrect expression.",
          result.detail ?? "Try another arrangement.",
          "incorrect",
        ),
      );
      return;
    }
    keyboardNumberActiveRef.current = false;

    const streak = current.streak + 1;
    const streakBonus = Math.min(12, current.streak * 2);
    const roundBonus = current.roundTimeLeft ? Math.max(0, current.roundTimeLeft - 4) : 0;
    const points = 10 + streakBonus + roundBonus;

    const solvedState: GameSession = {
      ...current,
      score: current.score + points,
      streak,
      bestStreak: Math.max(current.bestStreak, streak),
      correctCount: current.correctCount + 1,
      feedback: buildFeedback("success", "Correct!", `Great solve. ${TARGET_VALUE} locked in.`),
      lastResult: "correct",
      showSolution: false,
    };

      setSession(solvedState);

    if (shouldAutoAdvanceOnSolve) {
      autoAdvanceRef.current = window.setTimeout(() => {
        const latest = sessionRef.current;
        if (latest.status !== "playing") {
          return;
        }

        setSession(moveToNextRound(latest));
      }, AUTO_ADVANCE_DELAY_MS);
    }
  }, [applyMiss, clearAutoAdvance, moveToNextRound, shouldAutoAdvanceOnSolve]);

  const pause = useCallback(() => {
    const current = sessionRef.current;
    if (current.status !== "playing" || current.timeLeft === null) {
      return;
    }

    setSession({
      ...current,
      status: "paused",
      feedback: buildFeedback("info", "Paused", "Resume when you are ready."),
    });
    keyboardNumberActiveRef.current = false;
  }, []);

  const resume = useCallback(() => {
    const current = sessionRef.current;
    if (current.status !== "paused") {
      return;
    }

    setSession({
      ...current,
      status: "playing",
      feedback: buildFeedback("info", "Back in", "Timer resumed."),
    });
  }, []);

  const dismissFeedback = useCallback(() => {
    const current = sessionRef.current;
    if (!current.feedback) {
      return;
    }

    setSession({
      ...current,
      feedback: null,
    });
  }, []);

  const usedNumberCounts = useMemo(
    () => getUsedNumberCounts(session.expression),
    [session.expression],
  );

  return {
    session,
    config,
    usedNumberCounts,
    actions: {
      setExpression,
      appendToken,
      appendKeyboardDigit,
      backspace,
      clearExpression,
      submit,
      nextRound,
      revealSolution,
      pause,
      resume,
      restart,
      dismissFeedback,
    },
  };
}
