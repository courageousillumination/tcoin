import { Expression, ExpressionType, IdentifierExpression } from "./parse";

interface ExecutionEnvironment {
  getStorage: (key: string) => any;
  setStorage: (key: string, value: any) => any;
}

const evaluate = (
  expr: Expression,
  env?: ExecutionEnvironment,
  maxSteps?: number
) => {
  return new Evaluator(env, maxSteps).evaluate(expr);
};

class Environment {
  private readonly values = new Map<string, any>();

  constructor(public readonly parent: Environment | null) {}

  public set(name: string, value: any) {
    this.values.set(name, value);
  }

  public get(name: string): any {
    const value = this.values.get(name);
    if (value !== undefined) {
      return value;
    }
    return this.parent?.get(name);
  }
}

class Evaluator {
  private environment = new Environment(null);
  private steps = 0;

  constructor(
    executionEnvironment?: ExecutionEnvironment,
    private readonly maxSteps = Infinity
  ) {
    if (executionEnvironment) {
      this.registerBuiltin(
        "set-storage!",
        (key: Expression, value: Expression) =>
          executionEnvironment.setStorage(
            this.evaluate(key),
            this.evaluate(value)
          )
      );
      this.registerBuiltin("get-storage", (key: Expression) =>
        executionEnvironment.getStorage(this.evaluate(key))
      );
      this.registerBuiltin("has-storage", (key: Expression) => {
        return (
          executionEnvironment.getStorage(this.evaluate(key)) !== undefined
        );
      });
    }
  }

  public evaluate(expr: Expression): any {
    this.steps += 1;
    if (this.steps >= this.maxSteps) {
      throw new Error("Used up all of my gas");
    }
    switch (expr.type) {
      case ExpressionType.Apply:
        const proc = this.evaluate(expr.args[0]);
        return proc.apply(undefined, expr.args.slice(1));
      case ExpressionType.Identifier:
        return this.getIdentifierValue(expr.name);
      case ExpressionType.Literal:
        return expr.value;
    }
  }

  public getIdentifierValue = (
    name: string
  ): ((...args: Expression[]) => any) => {
    if (name === "if") {
      return (cond: Expression, a: Expression, b: Expression) => {
        if (this.evaluate(cond)) {
          return this.evaluate(a);
        } else {
          return this.evaluate(b);
        }
      };
    } else if (name === "eq") {
      return (a: Expression, b: Expression) => {
        return this.evaluate(a) === this.evaluate(b);
      };
    } else if (name === "begin") {
      return (...args: Expression[]) => {
        let result = null;
        for (const arg of args) {
          result = this.evaluate(arg);
        }
        return result;
      };
    } else if (name === "define") {
      return (symbol: Expression, value: Expression) => {
        if (symbol.type !== ExpressionType.Identifier) {
          throw new Error("define expects an identifier");
        }
        this.environment.set(symbol.name, this.evaluate(value));
      };
    } else if (name === "lambda") {
      return (symbols: Expression, expr: Expression) => {
        // The symbols may be wrapped in an Apply (since the parser is a bit dump and lambda is a special form)
        // TODO: Move lambda handling over to the parser? Also maybe other special forms like if?
        let unwrapedSymbols: IdentifierExpression[] = [];
        if (symbols.type === ExpressionType.Apply) {
          // TODO: Verify this...
          unwrapedSymbols = symbols.args as IdentifierExpression[];
        } else if (symbols.type === ExpressionType.Identifier) {
          unwrapedSymbols = [symbols];
        }

        // Now we need to inject those into the environment...
        return (...args: Expression[]) => {
          const environment = new Environment(this.environment);
          this.environment = environment;
          for (let i = 0; i < unwrapedSymbols.length; i++) {
            const value = evaluate(args[i]);
            this.environment.set(unwrapedSymbols[i].name, value);
          }

          // Actually run the function
          const result = this.evaluate(expr);
          // Restore the parent environment
          this.environment = this.environment.parent as Environment;
          return result;
        };
      };
    } else {
      const value = this.environment.get(name);
      if (value) {
        return value;
      }
      throw new Error(`Unknown symbol ${name}`);
    }
  };

  private registerBuiltin(key: string, value: any) {
    this.environment.set(key, value);
  }
}

export { evaluate, ExecutionEnvironment, Evaluator };
