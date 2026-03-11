export type GameMode = "classic" | "timed" | "easy" | "hard" | "challenge";

export type ThemePreference = "light" | "dark" | "system";

export type FeedbackType = "success" | "error" | "info";

export interface FeedbackMessage {
  id: number;
  type: FeedbackType;
  message: string;
  detail?: string;
}

export interface ModeConfig {
  id: GameMode;
  label: string;
  description: string;
  timed: boolean;
  sessionSeconds: number | null;
  roundSeconds: number | null;
  guaranteedSolvable: boolean;
  valueRange: [number, number];
  autoAdvanceOnSolve: boolean;
  mistakesAllowed: number | null;
}

export interface RoundData {
  hand: number[];
  solution: string | null;
  solvable: boolean;
}

export interface GameSettings {
  theme: ThemePreference;
  soundEnabled: boolean;
  defaultMode: GameMode;
}

export type HighScores = Record<GameMode, number>;

export type SessionStatus = "playing" | "paused" | "over";

export interface GameSession {
  mode: GameMode;
  status: SessionStatus;
  hand: number[];
  solution: string | null;
  solvable: boolean;
  expression: string;
  score: number;
  streak: number;
  bestStreak: number;
  round: number;
  correctCount: number;
  wrongCount: number;
  timeLeft: number | null;
  roundTimeLeft: number | null;
  mistakesLeft: number | null;
  showSolution: boolean;
  feedback: FeedbackMessage | null;
  lastResult: "correct" | "incorrect" | "timeout" | "skipped" | null;
}

export interface ValidationOutcome {
  ok: boolean;
  error?: string;
  detail?: string;
  valueText?: string;
}
