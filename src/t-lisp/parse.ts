import { Token } from "./tokenize";

// enum ExpressionType {
//   Literal,
//   Call,
//   Identifier,
// }

// interface LiteralExpression {
//   type: ExpressionType.Literal;
//   value: unknown;
// }

// interface CallExpression {
//   type: ExpressionType.Call;
//   proc: Expression;
//   args: Expression[];
// }

// interface IdentifierExpression {
//   type: ExpressionType.Identifier;
//   name: string;
// }

// interface Expression {}

const parse = (tokens: Token[], index = 0) => {
  const token = tokens[index];
  if (token.type === TokenType.LeftParen) {
  }
};

// class Parser {
//   constructor(private readonly tokens: Token[]) {}

//   public parse(): Expression[] {
//     return [];
//   }

//   private expression(): Expression {}

//   private match() {}
// }
