import { GameSettings, HighScores, ModeConfig } from "@/lib/game/types";

export const TARGET_VALUE = 24;

export const MODE_CONFIGS: Record<ModeConfig["id"], ModeConfig> = {
  classic: {
    id: "classic",
    label: "Classic",
    description: "Steady pace with solvable rounds.",
    timed: false,
    sessionSeconds: null,
    roundSeconds: null,
    guaranteedSolvable: true,
    valueRange: [1, 13],
    autoAdvanceOnSolve: false,
    mistakesAllowed: null,
  },
  timed: {
    id: "timed",
    label: "Timed",
    description: "90-second sprint. Chain correct answers.",
    timed: true,
    sessionSeconds: 90,
    roundSeconds: null,
    guaranteedSolvable: true,
    valueRange: [1, 13],
    autoAdvanceOnSolve: true,
    mistakesAllowed: null,
  },
  easy: {
    id: "easy",
    label: "Easy",
    description: "Smaller numbers. Every hand is solvable.",
    timed: false,
    sessionSeconds: null,
    roundSeconds: null,
    guaranteedSolvable: true,
    valueRange: [1, 9],
    autoAdvanceOnSolve: false,
    mistakesAllowed: null,
  },
  hard: {
    id: "hard",
    label: "Hard",
    description: "Fully random hands, solvable or not.",
    timed: false,
    sessionSeconds: null,
    roundSeconds: null,
    guaranteedSolvable: false,
    valueRange: [1, 13],
    autoAdvanceOnSolve: false,
    mistakesAllowed: null,
  },
  challenge: {
    id: "challenge",
    label: "Challenge",
    description: "75 seconds, 15-second rounds, 3 mistakes max.",
    timed: true,
    sessionSeconds: 75,
    roundSeconds: 15,
    guaranteedSolvable: true,
    valueRange: [1, 13],
    autoAdvanceOnSolve: true,
    mistakesAllowed: 3,
  },
};

export const DEFAULT_SETTINGS: GameSettings = {
  theme: "system",
  soundEnabled: true,
  defaultMode: "classic",
};

export const DEFAULT_HIGH_SCORES: HighScores = {
  classic: 0,
  timed: 0,
  easy: 0,
  hard: 0,
  challenge: 0,
};

export const STORAGE_KEYS = {
  settings: "twenty-four:settings",
  highScores: "twenty-four:high-scores",
};

export const HELP_SHORTCUTS = [
  { key: "Enter", action: "Submit expression" },
  { key: "Esc", action: "Clear expression" },
  { key: "N", action: "New round" },
  { key: "P", action: "Pause/Resume (timed modes)" },
  { key: "S", action: "Show solution" },
] as const;
