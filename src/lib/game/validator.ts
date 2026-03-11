import { TARGET_VALUE } from "@/lib/game/constants";
import { fractionEqualsInteger, formatFraction } from "@/lib/game/fraction";
import {
  collectLiterals,
  evaluateExpression,
  ExpressionSyntaxError,
  parseExpression,
  tokenizeExpression,
} from "@/lib/game/parser";
import { ValidationOutcome } from "@/lib/game/types";

function formatPointer(position: number) {
  return `Issue near character ${position + 1}.`;
}

function countMultiset(values: number[]): Map<number, number> {
  const counts = new Map<number, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
}

function compareUsage(hand: number[], used: number[]): { ok: boolean; error?: string; detail?: string } {
  if (used.length !== hand.length) {
    return {
      ok: false,
      error: `Use exactly ${hand.length} numbers.`,
      detail: `You used ${used.length}.`,
    };
  }

  const expected = countMultiset(hand);
  const usedCounts = countMultiset(used);

  for (const [value, expectedCount] of expected.entries()) {
    const usedCount = usedCounts.get(value) ?? 0;
    if (usedCount !== expectedCount) {
      if (usedCount < expectedCount) {
        return {
          ok: false,
          error: `Missing number ${value}.`,
          detail: `Expected ${expectedCount}, found ${usedCount}.`,
        };
      }

      return {
        ok: false,
        error: `Number ${value} used too many times.`,
        detail: `Expected ${expectedCount}, found ${usedCount}.`,
      };
    }
  }

  for (const value of usedCounts.keys()) {
    if (!expected.has(value)) {
      return {
        ok: false,
        error: `Number ${value} is not in this hand.`,
      };
    }
  }

  return { ok: true };
}

export function validateExpressionSubmission(expression: string, hand: number[]): ValidationOutcome {
  const trimmed = expression.trim();

  if (!trimmed) {
    return {
      ok: false,
      error: "Enter an expression before submitting.",
    };
  }

  if (trimmed.length > 120) {
    return {
      ok: false,
      error: "Expression is too long.",
      detail: "Keep it under 120 characters.",
    };
  }

  let ast;
  try {
    // Tokenize first to provide unsupported-token errors early.
    tokenizeExpression(trimmed);
    ast = parseExpression(trimmed);
  } catch (error) {
    if (error instanceof ExpressionSyntaxError) {
      return {
        ok: false,
        error: error.message,
        detail: formatPointer(error.position),
      };
    }

    return {
      ok: false,
      error: "Could not parse that expression.",
    };
  }

  const numbersUsed = collectLiterals(ast);
  const usage = compareUsage(hand, numbersUsed);
  if (!usage.ok) {
    return {
      ok: false,
      error: usage.error,
      detail: usage.detail,
    };
  }

  try {
    const value = evaluateExpression(ast);
    if (!fractionEqualsInteger(value, TARGET_VALUE)) {
      return {
        ok: false,
        error: "Expression does not equal 24.",
        detail: `It evaluates to ${formatFraction(value)}.`,
        valueText: formatFraction(value),
      };
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Division by zero")) {
      return {
        ok: false,
        error: "Division by zero is not allowed.",
      };
    }

    return {
      ok: false,
      error: "Expression could not be evaluated.",
    };
  }

  return {
    ok: true,
  };
}

export function getUsedNumberCounts(expression: string): Map<number, number> {
  const trimmed = expression.trim();
  if (!trimmed) {
    return new Map<number, number>();
  }

  try {
    const ast = parseExpression(trimmed);
    return countMultiset(collectLiterals(ast));
  } catch {
    return new Map<number, number>();
  }
}
