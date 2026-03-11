import { MODE_CONFIGS } from "@/lib/game/constants";
import { solve24 } from "@/lib/game/solver";
import { GameMode, RoundData } from "@/lib/game/types";
import { randomInt } from "@/lib/utils";

const FALLBACK_SOLVABLE_HAND = [3, 3, 8, 8];

function buildRandomHand(min: number, max: number): number[] {
  return [
    randomInt(min, max),
    randomInt(min, max),
    randomInt(min, max),
    randomInt(min, max),
  ];
}

export function generateRound(mode: GameMode): RoundData {
  const config = MODE_CONFIGS[mode];
  const [minValue, maxValue] = config.valueRange;
  const maxAttempts = 400;

  if (config.guaranteedSolvable) {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const hand = buildRandomHand(minValue, maxValue);
      const solution = solve24(hand);
      if (solution) {
        return {
          hand,
          solution,
          solvable: true,
        };
      }
    }

    return {
      hand: FALLBACK_SOLVABLE_HAND,
      solution: solve24(FALLBACK_SOLVABLE_HAND),
      solvable: true,
    };
  }

  const hand = buildRandomHand(minValue, maxValue);
  const solution = solve24(hand);

  return {
    hand,
    solution,
    solvable: Boolean(solution),
  };
}
