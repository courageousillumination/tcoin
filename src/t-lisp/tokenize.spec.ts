import { tokenize, TokenType } from "./tokenize";

describe("tokenize", () => {
  it("handles the special characters", () => {
    expect(tokenize("()")).toEqual([
      { type: TokenType.LeftParen, text: "(" },
      { type: TokenType.RightParen, text: ")" },
      { type: TokenType.EndOfFile, text: "" },
    ]);
  });

  it("handles string literals", () => {
    expect(tokenize('"foo"')).toEqual([
      { type: TokenType.String, text: '"foo"', object: "foo" },
      { type: TokenType.EndOfFile, text: "" },
    ]);
  });

  describe("handles numbers", () => {
    it("handles integers", () => {
      expect(tokenize("100")).toEqual([
        { type: TokenType.Number, text: "100", object: 100 },
        { type: TokenType.EndOfFile, text: "" },
      ]);
    });

    it("handles floats", () => {
      expect(tokenize("1.5")).toEqual([
        { type: TokenType.Number, text: "1.5", object: 1.5 },
        { type: TokenType.EndOfFile, text: "" },
      ]);
    });
  });

  it("handles comments", () => {
    expect(
      tokenize(`
      () ; None of this comes through
      ()`)
    ).toEqual([
      { type: TokenType.LeftParen, text: "(" },
      { type: TokenType.RightParen, text: ")" },
      { type: TokenType.LeftParen, text: "(" },
      { type: TokenType.RightParen, text: ")" },
      { type: TokenType.EndOfFile, text: "" },
    ]);
  });

  it("handles identifiers", () => {
    expect(tokenize("foo!")).toEqual([
      { type: TokenType.Identifier, text: "foo!" },
      { type: TokenType.EndOfFile, text: "" },
    ]);
  });
});
