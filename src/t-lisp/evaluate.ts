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
    this.registerBuiltin("eq", (a: unknown, b: unknown) => a === b);
    this.registerBuiltin(
      "begin",
      (...args: unknown[]) => args[args.length - 1]
    );
    // Custom built-ins to support the smart contract interaction.
    if (executionEnvironment) {
      this.registerBuiltin("set-storage!", (key: string, value: any) =>
        executionEnvironment.setStorage(key, value)
      );
      this.registerBuiltin("get-storage", (key: string) =>
        executionEnvironment.getStorage(key)
      );
      this.registerBuiltin("has-storage", (key: string) => {
        return executionEnvironment.getStorage(key) !== undefined;
      });
    }
  }

  public evaluate(expr: Expression): any {
    this.steps += 1;
    if (this.steps >= this.maxSteps) {
      throw new Error("Used up all of my gas");
    }
    switch (expr.type) {
      case ExpressionType.Proc:
        const proc = this.evaluate(expr.args[0]);
        return proc.apply(
          undefined,
          expr.args.slice(1).map((exp) => this.evaluate(exp))
        );
      case ExpressionType.Lambda:
        // Create a new lambda (with proper environment handling
        // and local variable injection).
        return (...args: Expression[]) => {
          const environment = new Environment(this.environment);
          this.environment = environment;
          for (let i = 0; i < expr.symbols.length; i++) {
            this.environment.set(expr.symbols[i].name, args[i]);
          }
          // Actually run the function
          const result = this.evaluate(expr.expr);
          // Restore the parent environment
          this.environment = this.environment.parent as Environment;
          return result;
        };
      case ExpressionType.If:
        if (this.evaluate(expr.cond)) {
          return this.evaluate(expr.then);
        } else {
          return this.evaluate(expr.otherwise);
        }
      case ExpressionType.Define:
        const value = this.evaluate(expr.value);
        this.environment.set(expr.symbol, value);
        return value;
      case ExpressionType.Identifier:
        return this.getIdentifierValue(expr.name);
      case ExpressionType.Literal:
        return expr.value;
    }
  }

  public getIdentifierValue = (name: string): any => {
    const value = this.environment.get(name);
    if (value) {
      return value;
    }
    throw new Error(`Unknown symbol ${name}`);
  };

  private registerBuiltin(key: string, value: any) {
    this.environment.set(key, value);
  }
}

export { evaluate, ExecutionEnvironment, Evaluator };
