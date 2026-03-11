export interface Fraction {
  numerator: number;
  denominator: number;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }

  return x || 1;
}

export function normalizeFraction(numerator: number, denominator: number): Fraction {
  if (denominator === 0) {
    throw new Error("Division by zero.");
  }

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
    throw new Error("Invalid numeric value.");
  }

  const sign = denominator < 0 ? -1 : 1;
  const safeNumerator = numerator * sign;
  const safeDenominator = denominator * sign;
  const divisor = gcd(safeNumerator, safeDenominator);

  return {
    numerator: safeNumerator / divisor,
    denominator: safeDenominator / divisor,
  };
}

export function fraction(numerator: number, denominator = 1): Fraction {
  return normalizeFraction(numerator, denominator);
}

export function addFractions(left: Fraction, right: Fraction): Fraction {
  return normalizeFraction(
    left.numerator * right.denominator + right.numerator * left.denominator,
    left.denominator * right.denominator,
  );
}

export function subtractFractions(left: Fraction, right: Fraction): Fraction {
  return normalizeFraction(
    left.numerator * right.denominator - right.numerator * left.denominator,
    left.denominator * right.denominator,
  );
}

export function multiplyFractions(left: Fraction, right: Fraction): Fraction {
  return normalizeFraction(
    left.numerator * right.numerator,
    left.denominator * right.denominator,
  );
}

export function divideFractions(left: Fraction, right: Fraction): Fraction {
  if (right.numerator === 0) {
    throw new Error("Division by zero.");
  }

  return normalizeFraction(
    left.numerator * right.denominator,
    left.denominator * right.numerator,
  );
}

export function negateFraction(value: Fraction): Fraction {
  return fraction(-value.numerator, value.denominator);
}

export function fractionEqualsInteger(value: Fraction, integer: number): boolean {
  return value.numerator === integer * value.denominator;
}

export function fractionToNumber(value: Fraction): number {
  return value.numerator / value.denominator;
}

export function formatFraction(value: Fraction): string {
  if (value.denominator === 1) {
    return `${value.numerator}`;
  }

  const decimal = fractionToNumber(value);
  const rounded = Number.isInteger(decimal) ? `${decimal}` : decimal.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");

  return `${value.numerator}/${value.denominator} (${rounded})`;
}
