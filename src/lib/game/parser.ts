import {
  addFractions,
  divideFractions,
  fraction,
  Fraction,
  multiplyFractions,
  negateFraction,
  subtractFractions,
} from "@/lib/game/fraction";

export type BinaryOperator = "+" | "-" | "*" | "/";

interface NumberToken {
  type: "number";
  value: number;
  start: number;
}

interface OperatorToken {
  type: "operator";
  value: "+" | "-" | "*" | "/" | "(" | ")";
  start: number;
}

type Token = NumberToken | OperatorToken;

export interface LiteralNode {
  type: "literal";
  value: number;
}

export interface UnaryNode {
  type: "unary";
  operator: "-";
  operand: ExpressionNode;
}

export interface BinaryNode {
  type: "binary";
  operator: BinaryOperator;
  left: ExpressionNode;
  right: ExpressionNode;
}

export type ExpressionNode = LiteralNode | UnaryNode | BinaryNode;

export class ExpressionSyntaxError extends Error {
  readonly position: number;

  constructor(message: string, position: number) {
    super(message);
    this.name = "ExpressionSyntaxError";
    this.position = position;
  }
}

export function tokenizeExpression(input: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < input.length) {
    const char = input[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (/\d/.test(char)) {
      let end = index + 1;
      while (end < input.length && /\d/.test(input[end])) {
        end += 1;
      }

      const raw = input.slice(index, end);
      tokens.push({
        type: "number",
        value: Number.parseInt(raw, 10),
        start: index,
      });
      index = end;
      continue;
    }

    if (char === "+" || char === "-" || char === "*" || char === "/" || char === "(" || char === ")") {
      tokens.push({
        type: "operator",
        value: char,
        start: index,
      });
      index += 1;
      continue;
    }

    throw new ExpressionSyntaxError(`Unsupported token \"${char}\".`, index);
  }

  return tokens;
}

class Parser {
  private readonly tokens: Token[];
  private index = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): ExpressionNode {
    if (this.tokens.length === 0) {
      throw new ExpressionSyntaxError("Expression is empty.", 0);
    }

    const expression = this.parseAddSub();

    if (!this.isAtEnd()) {
      const next = this.peek();
      throw new ExpressionSyntaxError("Unexpected token.", next.start);
    }

    return expression;
  }

  private parseAddSub(): ExpressionNode {
    let node = this.parseMulDiv();

    while (this.match("+", "-")) {
      const operator = this.previous().value as BinaryOperator;
      const right = this.parseMulDiv();
      node = {
        type: "binary",
        operator,
        left: node,
        right,
      };
    }

    return node;
  }

  private parseMulDiv(): ExpressionNode {
    let node = this.parseUnary();

    while (this.match("*", "/")) {
      const operator = this.previous().value as BinaryOperator;
      const right = this.parseUnary();
      node = {
        type: "binary",
        operator,
        left: node,
        right,
      };
    }

    return node;
  }

  private parseUnary(): ExpressionNode {
    if (this.match("-")) {
      const operand = this.parseUnary();
      return {
        type: "unary",
        operator: "-",
        operand,
      };
    }

    if (this.match("+")) {
      return this.parseUnary();
    }

    return this.parsePrimary();
  }

  private parsePrimary(): ExpressionNode {
    if (this.matchNumber()) {
      const numberToken = this.previous() as NumberToken;
      return {
        type: "literal",
        value: numberToken.value,
      };
    }

    if (this.match("(")) {
      const expression = this.parseAddSub();
      if (!this.match(")")) {
        const token = this.peek() ?? this.previous();
        throw new ExpressionSyntaxError("Missing closing parenthesis.", token.start);
      }
      return expression;
    }

    const token = this.peek() ?? this.previous();
    throw new ExpressionSyntaxError("Expected a number or opening parenthesis.", token.start);
  }

  private match(...operators: OperatorToken["value"][]): boolean {
    if (this.isAtEnd()) {
      return false;
    }

    const token = this.peek();
    if (token.type !== "operator") {
      return false;
    }

    if (!operators.includes(token.value)) {
      return false;
    }

    this.index += 1;
    return true;
  }

  private matchNumber(): boolean {
    if (this.isAtEnd()) {
      return false;
    }

    const token = this.peek();
    if (token.type !== "number") {
      return false;
    }

    this.index += 1;
    return true;
  }

  private previous(): Token {
    return this.tokens[this.index - 1];
  }

  private peek(): Token {
    return this.tokens[this.index];
  }

  private isAtEnd(): boolean {
    return this.index >= this.tokens.length;
  }
}

export function parseExpression(input: string): ExpressionNode {
  const tokens = tokenizeExpression(input);
  return new Parser(tokens).parse();
}

export function evaluateExpression(node: ExpressionNode): Fraction {
  if (node.type === "literal") {
    return fraction(node.value);
  }

  if (node.type === "unary") {
    const operand = evaluateExpression(node.operand);
    return negateFraction(operand);
  }

  const left = evaluateExpression(node.left);
  const right = evaluateExpression(node.right);

  switch (node.operator) {
    case "+":
      return addFractions(left, right);
    case "-":
      return subtractFractions(left, right);
    case "*":
      return multiplyFractions(left, right);
    case "/":
      return divideFractions(left, right);
    default:
      throw new Error("Unknown operator.");
  }
}

export function collectLiterals(node: ExpressionNode): number[] {
  if (node.type === "literal") {
    return [node.value];
  }

  if (node.type === "unary") {
    return collectLiterals(node.operand);
  }

  return [...collectLiterals(node.left), ...collectLiterals(node.right)];
}
