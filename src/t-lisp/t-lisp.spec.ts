import { evaluate, Evaluator, Parser, tokenize } from "./t-lisp";

describe("t-lisp", () => {
  describe("tokenizing", () => {
    it("tokenizes a simple expression", () => {
      expect(tokenize('(eq "foo" "foo")')).toBeTruthy();
    });
  });

  describe("parser", () => {
    it("parses", () => {
      const tokens = tokenize('(eq "foo" "foo")');
      const parser = new Parser(tokens);
      expect(parser.parse()).toBeTruthy();
    });
  });

  describe("evaluate", () => {
    it("evaluates", () => {
      const tokens = tokenize('(if (eq "foo" "foo") "foo" "bar")');
      const parser = new Parser(tokens);
      const expression = parser.parse();
      expect(evaluate(expression)).toEqual("foo");
    });

    it("interacts with storage", () => {
      const tokens = tokenize('(setStorage "foo" "baz")');
      const parser = new Parser(tokens);
      const expression = parser.parse();
      const evaluator = new Evaluator();
      evaluator.evaluate(expression);
      expect(evaluator.getStorage("foo")).toEqual("baz");
    });
  });
});
