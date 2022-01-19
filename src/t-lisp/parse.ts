import { Token, TokenType } from "./tokenize";

enum ExpressionType {
  Proc,
  Identifier,
  Literal,
  Lambda,
  If,
  Define,
}

interface ProcExpression {
  type: ExpressionType.Proc;
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

interface LambdaExpression {
  type: ExpressionType.Lambda;
  symbols: IdentifierExpression[];
  expr: Expression;
}

interface IfExpression {
  type: ExpressionType.If;
  cond: Expression;
  then: Expression;
  otherwise: Expression;
}

interface DefineExpression {
  type: ExpressionType.Define;
  symbol: string;
  value: Expression;
}

type Expression =
  | ProcExpression
  | IdentifierExpression
  | LiteralExpression
  | LambdaExpression
  | IfExpression
  | DefineExpression;

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
        const next = this.tokens[0];
        if (next.type === TokenType.Identifier) {
          if (next.text === "lambda") {
            return this.handleLambda();
          }
          if (next.text === "if") {
            this.tokens.shift();
            const cond = this.parse();
            const then = this.parse();
            const otherwise = this.parse();
            this.consume(TokenType.RightParen);
            return {
              type: ExpressionType.If,
              cond,
              then,
              otherwise,
            };
          }
          if (next.text === "define") {
            this.tokens.shift();
            const symbol = this.tokens.shift()?.text as string;
            const value = this.parse();
            this.consume(TokenType.RightParen);
            return {
              type: ExpressionType.Define,
              symbol,
              value,
            };
          }
        }
        return this.handleProc();
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

  private handleLambda(): Expression {
    this.tokens.shift();

    // Pull the opening (
    this.consume(TokenType.LeftParen);

    const symbols: IdentifierExpression[] = [];
    while (this.tokens.length && this.tokens[0].type !== TokenType.RightParen) {
      symbols.push(this.parse() as IdentifierExpression);
    }

    // Pull the closing )
    this.consume(TokenType.RightParen);

    const expr = this.parse();

    // Final closing.
    this.consume(TokenType.RightParen);

    return {
      type: ExpressionType.Lambda,
      symbols,
      expr,
    };
  }

  private handleProc(): Expression {
    const args = [];

    while (this.tokens.length && this.tokens[0].type !== TokenType.RightParen) {
      args.push(this.parse());
    }

    this.consume(TokenType.RightParen);

    return {
      type: ExpressionType.Proc,
      args,
    };
  }

  private consume(type?: TokenType) {
    const token = this.tokens.shift();
    if (type !== undefined && token?.type !== type) {
      throw new Error(`Expected token ${type}`);
    }
  }
}

export { parse, Parser, Expression, ExpressionType, IdentifierExpression };
