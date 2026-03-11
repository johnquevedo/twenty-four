import {
  addFractions,
  divideFractions,
  fraction,
  fractionEqualsInteger,
  Fraction,
  multiplyFractions,
  subtractFractions,
} from "@/lib/game/fraction";
import { TARGET_VALUE } from "@/lib/game/constants";

interface SolverNode {
  value: Fraction;
  expression: string;
}

function nodeKey(node: SolverNode) {
  return `${node.value.numerator}/${node.value.denominator}`;
}

function stateKey(nodes: SolverNode[]) {
  return nodes
    .map(nodeKey)
    .sort()
    .join("|");
}

function combineNodes(a: SolverNode, b: SolverNode): SolverNode[] {
  const results: SolverNode[] = [];

  results.push({
    value: addFractions(a.value, b.value),
    expression: `(${a.expression}+${b.expression})`,
  });

  results.push({
    value: multiplyFractions(a.value, b.value),
    expression: `(${a.expression}*${b.expression})`,
  });

  results.push({
    value: subtractFractions(a.value, b.value),
    expression: `(${a.expression}-${b.expression})`,
  });

  results.push({
    value: subtractFractions(b.value, a.value),
    expression: `(${b.expression}-${a.expression})`,
  });

  if (b.value.numerator !== 0) {
    results.push({
      value: divideFractions(a.value, b.value),
      expression: `(${a.expression}/${b.expression})`,
    });
  }

  if (a.value.numerator !== 0) {
    results.push({
      value: divideFractions(b.value, a.value),
      expression: `(${b.expression}/${a.expression})`,
    });
  }

  return results;
}

function solveNodes(nodes: SolverNode[], deadStates: Set<string>): string | null {
  if (nodes.length === 1) {
    return fractionEqualsInteger(nodes[0].value, TARGET_VALUE)
      ? nodes[0].expression
      : null;
  }

  const key = stateKey(nodes);
  if (deadStates.has(key)) {
    return null;
  }

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const rest = nodes.filter((_, idx) => idx !== i && idx !== j);
      const candidates = combineNodes(nodes[i], nodes[j]);

      for (const candidate of candidates) {
        const found = solveNodes([...rest, candidate], deadStates);
        if (found) {
          return found;
        }
      }
    }
  }

  deadStates.add(key);
  return null;
}

/**
 * Exhaustive 24-game solver.
 *
 * It tries every pair-combination order and operator application using exact
 * fraction arithmetic to avoid floating-point drift.
 */
export function solve24(numbers: number[]): string | null {
  if (numbers.length !== 4) {
    throw new Error("24 solver expects exactly 4 numbers.");
  }

  const nodes: SolverNode[] = numbers.map((value) => ({
    value: fraction(value),
    expression: `${value}`,
  }));

  return solveNodes(nodes, new Set<string>());
}

export function isSolvable24(numbers: number[]): boolean {
  return solve24(numbers) !== null;
}
