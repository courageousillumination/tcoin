import { evaluate, ExecutionEnvironment } from "./evaluate";
import { tokenize } from "./tokenize";
import { parse } from "./parse";

class SimpleExecutionEnvironment {
  private readonly storage = new Map<string, any>();

  public setStorage(key: string, value: string) {
    this.storage.set(key, value);
  }

  public getStorage(key: string) {
    return this.storage.get(key);
  }
}

describe("evaluate", () => {
  const runSource = (
    source: string,
    executionEnvironment?: ExecutionEnvironment,
    maxSteps?: number
  ) => {
    return evaluate(parse(tokenize(source)), executionEnvironment, maxSteps);
  };

  it("evaluates a literal expression", () => {
    expect(runSource('"foo"')).toEqual("foo");
  });

  it("evaluates a comparison", () => {
    expect(runSource("(eq 1 1)")).toEqual(true);
  });

  it("evaluates a conditional", () => {
    expect(runSource("(if (eq 1 1) 2 3)")).toEqual(2);
    expect(runSource("(if (eq 1 2) 2 3)")).toEqual(3);
  });

  it("sequences expressions", () => {
    expect(runSource("(begin 1 2 3)")).toEqual(3);
  });

  it("defines identifiers", () => {
    expect(runSource("(begin (define x 4) x)")).toEqual(4);
  });

  it("supports lambdas", () => {
    expect(
      runSource("(begin (define eq2 (lambda (x) (eq x 2))) (eq2 2))")
    ).toEqual(true);
  });

  it("should only inject names locally", () => {
    expect(
      runSource(`
      (begin
        (define eq2 (lambda (x) (eq x 2)))  
        (define x 5)
        (eq2 2)
        x
      )
      `)
    ).toEqual(5);
  });

  it("allows interaction with storage", () => {
    const executionEnvironment = new SimpleExecutionEnvironment();
    runSource(`(set-storage! "foo" 5)`, executionEnvironment);
    expect(executionEnvironment.getStorage("foo")).toEqual(5);
  });

  it("supports a full smart contract", () => {
    // This is a simple "smart contract" that allows writing to storage.
    // exactly once. This could be used for something like a name registration system.
    const result = runSource(
      `
      (begin
        (define register-value! 
            (lambda (key value) 
                (if (has-storage key)
                    0                           ; we already have our value and we've promised not to overwrite it.
                    (set-storage! key value)))) ; we can set the new value
        (register-value! "foo" 5)               ; this should succeed
        (register-value! "foo" 3)               ; this should fail (but silently)
        (get-storage "foo"))
      `,
      new SimpleExecutionEnvironment()
    );
    expect(result).toEqual(5);
  });

  it("supports max steps", () => {
    expect(() => runSource(`(eq 1 1)`, undefined, 0)).toThrow();
    expect(runSource(`(eq 1 1)`, undefined, 10)).toEqual(true);
  });
});
