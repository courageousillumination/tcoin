import { ExpressionType, parse } from "./parse";
import { tokenize, TokenType } from "./tokenize";

describe("parse", () => {
  it("parses a simple identifier", () => {
    expect(parse(tokenize("foo!"))).toEqual({
      type: ExpressionType.Identifier,
      name: "foo!",
    });
  });

  it("parses a application", () => {
    expect(parse(tokenize("(foo bar)"))).toEqual({
      type: ExpressionType.Proc,
      args: [
        { type: ExpressionType.Identifier, name: "foo" },
        { type: ExpressionType.Identifier, name: "bar" },
      ],
    });
  });

  it("parses literals", () => {
    expect(parse(tokenize("1.0"))).toEqual({
      type: ExpressionType.Literal,
      value: 1.0,
    });

    expect(parse(tokenize('"foo"'))).toEqual({
      type: ExpressionType.Literal,
      value: "foo",
    });
  });

  it("handles lambdas", () => {
    expect(parse(tokenize("(lambda (a) a)"))).toEqual({
      type: ExpressionType.Lambda,
      symbols: [{ type: ExpressionType.Identifier, name: "a" }],
      expr: { type: ExpressionType.Identifier, name: "a" },
    });
  });

  it("handles errors", () => {
    expect(() => parse(tokenize("(foo"))).toThrow();
  });
});
