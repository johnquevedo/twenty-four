import { Delete, Lightbulb, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameSession } from "@/lib/game/types";
import { cn } from "@/lib/utils";

interface ExpressionPanelProps {
  session: GameSession;
  onExpressionChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  onBackspace: () => void;
  onAppendToken: (token: string) => void;
  onShowSolution: () => void;
  onNextRound: (options?: { skipped?: boolean }) => void;
}

const INPUT_OPERATORS = ["+", "-", "*", "/", "(", ")"] as const;

export function ExpressionPanel({
  session,
  onExpressionChange,
  onSubmit,
  onClear,
  onBackspace,
  onAppendToken,
  onShowSolution,
  onNextRound,
}: ExpressionPanelProps) {
  const inputDisabled = session.status !== "playing";

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--bg-panel)] p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Build your expression</h2>
          <p className="text-sm text-[var(--text-secondary)]">Use each card exactly once and hit 24.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNextRound({ skipped: session.lastResult !== "correct" })}
            disabled={session.status === "over"}
          >
            <RotateCcw className="size-4" /> New Round
          </Button>
          <Button variant="ghost" size="sm" onClick={onShowSolution}>
            <Lightbulb className="size-4" /> Show Solution
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <label htmlFor="expression-input" className="sr-only">
          Expression input
        </label>
        <input
          id="expression-input"
          autoComplete="off"
          inputMode="text"
          spellCheck={false}
          value={session.expression}
          onChange={(event) => onExpressionChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSubmit();
            }

            if (event.key === "Escape") {
              event.preventDefault();
              onClear();
            }
          }}
          disabled={inputDisabled}
          placeholder="Example: (8-3)*(7-1)"
          className={cn(
            "h-14 w-full rounded-2xl border bg-[var(--surface-soft)] px-4 text-lg text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
            inputDisabled ? "border-[var(--border)] opacity-70" : "border-[var(--border-strong)]",
          )}
        />
        <div className="flex flex-wrap gap-2">
          {INPUT_OPERATORS.map((operator) => (
            <Button
              key={operator}
              variant="secondary"
              size="sm"
              disabled={inputDisabled}
              onClick={() => onAppendToken(operator)}
              aria-label={`Insert operator ${operator}`}
            >
              {operator}
            </Button>
          ))}
          <Button variant="ghost" size="sm" disabled={inputDisabled} onClick={onBackspace}>
            <Delete className="size-4" /> Backspace
          </Button>
          <Button variant="ghost" size="sm" disabled={inputDisabled} onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="primary" size="lg" disabled={inputDisabled} onClick={onSubmit}>
          <Send className="size-4" /> Submit
        </Button>
      </div>

      {session.showSolution ? (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-sm text-[var(--text-secondary)]">
          <p className="font-medium text-[var(--text-primary)]">Solver output</p>
          <p className="mt-1 font-mono">
            {session.solvable
              ? session.solution ?? "A solution exists, but none was reconstructed."
              : "No valid expression reaches 24 for this hand."}
          </p>
        </div>
      ) : null}
    </section>
  );
}
