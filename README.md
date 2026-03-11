# Twenty Four

A minimalist, speed-run version of the **24 Game** built with Next.js, React, TypeScript, Tailwind CSS, and Framer Motion.

## Current Experience

The app has two screens:

1. **Setup screen**
- Choose difficulty: `Easy`, `Medium`, `Hard`
- Enter any run time in seconds (minimum `5`)
- Start the run manually

2. **Run screen**
- Solve as many boards as possible before time runs out
- Correct submissions auto-advance to the next board
- No `Solve` button in run mode
- End-of-run panel shows:
  - total boards solved
  - estimated worldwide percentile

## Rules

- You are dealt 4 numbers.
- Build an expression equal to `24`.
- Use all 4 numbers exactly once.
- Allowed operators: `+`, `-`, `*`, `/`, and parentheses.

## Input Behavior

- Click numbers/operators or use keyboard input.
- `Backspace` deletes characters.
- `Enter` submits.
- Keyboard supports digits and operators (`+ - * / ( )`).
- Right parenthesis behavior:
  - closes existing open groups when available
  - otherwise wraps the current expression in parentheses
- Multi-digit keyboard entry is supported (e.g. typing `12` as one number token).

## Validation & Safety

- No raw `eval` is used.
- Expression parsing and evaluation are done safely with an AST.
- Validation checks:
  - syntax validity
  - allowed tokens only
  - exact multiset use of dealt numbers
  - final value equals `24`
- Arithmetic uses fraction math to avoid floating-point drift.

## Difficulty Mapping

UI difficulty is mapped to engine modes:

- `Easy` -> solver-guaranteed easy hand generation
- `Medium` -> classic solvable generation
- `Hard` -> fully random hand generation (may be unsolvable)

## Percentile Note

The “world percentile” shown after a run is an **in-app estimate** based on solved count, run duration, and difficulty.
It is **not** backed by a live global leaderboard.

## Local Persistence

The app persists:

- selected difficulty
- selected run duration

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React

## Project Structure (Primary)

- `src/components/game/game-app.tsx`
  - setup screen + run screen UI
- `src/hooks/use-game-engine.ts`
  - run/session state, timers, token insertion, submit/advance flow
- `src/lib/game/solver.ts`
  - 24 solver + expression reconstruction
- `src/lib/game/parser.ts`
  - tokenizer/parser/AST evaluator
- `src/lib/game/validator.ts`
  - safe submission validation
- `src/lib/game/fraction.ts`
  - exact rational arithmetic
- `src/lib/game/generator.ts`
  - difficulty-aware hand generation

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```
