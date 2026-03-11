# Twenty Four

Simple speed-run version of the 24 Game.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## How It Works

1. Pick difficulty: `Easy`, `Medium`, or `Hard`
2. Enter any time in seconds
3. Press **Start Run**
4. Solve as many boards as you can before time runs out

Correct answers auto-load the next board.

## Rules

- You get 4 numbers
- Use all 4 exactly once
- Make expression value = 24
- Allowed: `+ - * / ( )`

## Controls

- Click numbers/operators
- Keyboard digits and operators work too
- `Backspace` = delete
- `Enter` = submit

## Notes

- Validation is safe (no `eval`)
- End of run shows solved count and estimated percentile

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```
