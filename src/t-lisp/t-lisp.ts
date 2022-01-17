import { parse } from "./parse";
import { tokenize } from "./tokenize";
import { evaluate, ExecutionEnvironment } from "./evaluate";

const run = (source: string, env: ExecutionEnvironment) =>
  evaluate(parse(tokenize(source)), env);

export { run };
