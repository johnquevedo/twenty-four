# Twenty Four

A production-style, modern implementation of the **24 Game** built with Next.js, React, TypeScript, Tailwind CSS, and Framer Motion.

## Highlights

- Safe expression parsing and validation (no `eval`)
- Exact-number usage validation (multiset matching)
- Fraction-based arithmetic for robust math checks
- Real solver that can confirm solvability and reconstruct a valid expression
- Multiple game modes:
  - `Classic` (solvable rounds)
  - `Easy` (smaller, solvable numbers)
  - `Hard` (fully random hands)
  - `Timed` (session countdown)
  - `Challenge` (session + round clocks + limited mistakes)
- Score/streak/high-score tracking
- Pause/resume in timed contexts
- Game-over summary modal
- How-to-play and settings modals
- Dark mode with persisted theme preference
- Sound effects toggle (Web Audio API)
- Keyboard-friendly controls
- Responsive UI with polished transitions

## Stack

- [Next.js](https://nextjs.org/) (App Router)
- React + TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React (icons)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev     # start local dev server
npm run lint    # run ESLint
npm run build   # production build
npm run start   # serve production build
```

## Gameplay Rules

1. You are dealt 4 numbers.
2. Build an expression equal to `24`.
3. Use all 4 numbers exactly once.
4. Allowed operators: `+`, `-`, `*`, `/`, and parentheses.

## Architecture

### 1) Game Logic Is Isolated from UI

All core logic lives in `src/lib/game/`:

- `solver.ts`: exhaustive 24-solver with expression reconstruction
- `parser.ts`: tokenizer + recursive-descent parser + AST evaluator
- `validator.ts`: syntax, allowed tokens, number multiset usage, value checks
- `fraction.ts`: exact rational arithmetic helpers
- `generator.ts`: mode-aware hand generation (including solvable-only modes)
- `constants.ts` / `types.ts`: mode settings and shared contracts

### 2) State Management via Hook

`src/hooks/use-game-engine.ts` manages session transitions:

- round lifecycle
- submit handling
- score/streak progression
- timer/round timer
- pause/resume
- challenge mistake budget
- game-over state

### 3) Persistent Product State

Local persistence is handled via `src/hooks/use-persistent-state.ts`:

- settings (`theme`, `sound`, `default mode`)
- high scores per mode
- last selected mode

### 4) UX Layer

`src/components/game/` contains modular UI blocks:

- `game-app.tsx`: composition root
- `hud.tsx`: score/streak/timer dashboard
- `number-board.tsx`: animated deal cards
- `expression-panel.tsx`: central expression workflow
- `feedback-toast.tsx`: contextual feedback
- `pause-overlay.tsx`, `settings-modal.tsx`, `how-to-play-modal.tsx`, `game-over-modal.tsx`

## Safety and Validation Notes

- No raw string evaluation is used.
- Input is tokenized and parsed into an AST.
- Unsupported tokens and malformed syntax are rejected with precise feedback.
- Number usage is validated as an exact multiset match against the dealt hand.
- Arithmetic evaluation uses fractions to avoid floating-point drift around 24.

## Keyboard Shortcuts

- `Enter`: submit expression
- `Esc`: clear expression
- `N`: new round
- `P`: pause/resume (timed modes)
- `S`: show solution
- `?`: open help
# twenty-four
