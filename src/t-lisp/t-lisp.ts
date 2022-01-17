interface CallExpression {
  type: "call";
  arguments: Expression[];
}

interface IdentifierExpression {
  type: "identifier";
  name: string;
}

interface LiteralExpression {
  type: "literal";
  value: unknown;
}

type Expression = IdentifierExpression | CallExpression | LiteralExpression;

enum TokenType {
  Identifier,
  StringLiteral,
  NumberLiteral,
  LeftParen,
  RightParen,
}

interface Token {
  type: TokenType;
  value: string;
}

class Evaluator {
  private readonly storage = new Map<string, unknown>();

  public getStorage(key: string) {
    return this.storage.get(key);
  }

  public lookupIdentifier = (name: string) => {
    if (name === "eq") {
      return (a: unknown, b: unknown) => a === b;
    }
    if (name === "if") {
      return (a: boolean, b: unknown, c: unknown) => {
        if (a) {
          return b;
        } else {
          return c;
        }
      };
    }
    if (name === "getStorage") {
      return (key: string) => {
        return this.storage.get(key);
      };
    }

    if (name === "setStorage") {
      return (key: string, value: unknown) => {
        this.storage.set(key, value);
      };
    }
    throw new Error("unknown identifier");
  };

  public evaluate = (expression: Expression) => {
    switch (expression.type) {
      case "call":
        const args: unknown[] = expression.arguments.map(
          this.evaluate.bind(this)
        );
        const func = args[0] as any;
        return func.call(undefined, ...args.slice(1));
      case "identifier":
        return this.lookupIdentifier(expression.name);
      case "literal":
        return expression.value;
    }
  };
}

const evaluate = (input: Expression) => {
  const evaluator = new Evaluator();
  return evaluator.evaluate(input);
};

const isAlpha = (char: string) => char.match(/[a-z]/i);

const tokenize = (input: string): Token[] => {
  let position = 0;
  const tokens: Token[] = [];
  while (position < input.length) {
    if (input[position] === "(") {
      tokens.push({ type: TokenType.LeftParen, value: "(" });
    } else if (input[position] === ")") {
      tokens.push({ type: TokenType.RightParen, value: ")" });
    } else if (input[position] === '"') {
      const start = position;
      do {
        position += 1;
      } while (position <= input.length && input[position] !== '"');
      tokens.push({
        type: TokenType.StringLiteral,
        value: input.slice(start + 1, position),
      });
    } else if (isAlpha(input[position])) {
      const start = position;
      do {
        position += 1;
      } while (position <= input.length && isAlpha(input[position]));
      tokens.push({
        type: TokenType.Identifier,
        value: input.slice(start, position),
      });
    }

    position += 1;
  }
  return tokens;
};

class Parser {
  private position = 0;

  constructor(private readonly tokens: Token[]) {}

  public parse(): Expression {
    return this.expression();
  }

  private expression(): Expression {
    return this.call();
  }

  private call(): Expression {
    if (this.match(TokenType.LeftParen)) {
      const args: Expression[] = [];
      while (!this.match(TokenType.RightParen)) {
        args.push(this.expression());
      }
      return {
        type: "call",
        arguments: args,
      };
    }
    return this.literal();
  }

  private literal(): Expression {
    const token = this.forward();
    if (token.type === TokenType.Identifier) {
      return {
        type: "identifier",
        name: token.value,
      };
    } else if (token.type === TokenType.StringLiteral) {
      return {
        type: "literal",
        value: token.value,
      };
    } else {
      throw new Error("Unexpected token");
    }
  }

  private match(type: TokenType): boolean {
    if (this.tokens[this.position].type === type) {
      this.forward();
      return true;
    }
    return false;
  }

  private forward() {
    const token = this.tokens[this.position];
    this.position += 1;
    return token;
  }
}

export { tokenize, Parser, evaluate, Evaluator };
