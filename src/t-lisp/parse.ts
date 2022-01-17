import { Token, TokenType } from "./tokenize";

enum ExpressionType {
  Apply,
  Identifier,
  Literal,
}

interface ApplyExpression {
  type: ExpressionType.Apply;
  args: Expression[];
}

interface IdentifierExpression {
  type: ExpressionType.Identifier;
  name: string;
}

interface LiteralExpression {
  type: ExpressionType.Literal;
  value: unknown;
}

type Expression = ApplyExpression | IdentifierExpression | LiteralExpression;

const parse = (tokens: Token[]) => {
  const parser = new Parser(tokens);
  return parser.parse();
};

class Parser {
  constructor(private readonly tokens: Token[]) {}

  public parse(): Expression {
    const token = this.tokens.shift();

    if (token === undefined) {
      throw new Error("Unexpected end of token stream.");
    }

    switch (token.type) {
      case TokenType.LeftParen:
        const args = [];

        while (
          this.tokens.length &&
          this.tokens[0].type !== TokenType.RightParen
        ) {
          args.push(this.parse());
        }

        const closing = this.tokens.shift();
        if (closing?.type !== TokenType.RightParen) {
          throw new Error("Expected a closing ')'");
        }

        return {
          type: ExpressionType.Apply,
          args,
        };
      case TokenType.Identifier:
        return {
          type: ExpressionType.Identifier,
          name: token.text,
        };
      case TokenType.String:
      case TokenType.Number:
        return {
          type: ExpressionType.Literal,
          value: token.object,
        };
      case TokenType.RightParen:
        throw new Error("Unexpected ')'");
      case TokenType.EndOfFile:
        // We should never actually parse this since everything is nested.
        throw new Error("Unexepected EoF");
      default:
        throw new Error(`Unknown token type ${token.type}`);
    }
  }
}

export { parse, Parser, Expression, ExpressionType, IdentifierExpression };
