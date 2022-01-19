// Add two new messages:
// 1) deploySmartContract: That adds the smart contract to the current block.
// 2) callSmartContract: Look up and call the smart contract.

import { parse } from "../t-lisp/parse";
import { hash } from "../common/crypto";
import { ExecutionEnvironment, Evaluator } from "../t-lisp/evaluate";
import { tokenize } from "../t-lisp/tokenize";

interface SmartContract {
  /** Unique ID for this smart contract.  */
  id: string;

  /** Raw code for this contract. */
  code: string;

  /** State of the contract. */
  storage: Record<string, unknown>;
}

/**
 * Generates a hash for a smart contract.
 * @param contract
 * @returns
 */
const hashSmartContract = (contract: SmartContract) => {
  return hash(contract.code);
};

const callSmartContract = (
  contract: SmartContract,
  func: string,
  args: unknown[]
) => {
  const stateCopy = { ...contract.storage };
  const executionEnvironment: ExecutionEnvironment = {
    getStorage: (key) => stateCopy[key],
    setStorage: (key, value) => {
      stateCopy[key] = value;
    },
  };

  const runtime = new Evaluator(executionEnvironment);
  try {
    runtime.evaluate(parse(tokenize(contract.code)));
    // Ugh this is super hacky reconstructing the function call. Maybe we should just
    // accept some source? Idk.
    runtime.evaluate(
      parse(
        tokenize(`(${func} ${args.map((x) => JSON.stringify(x)).join(" ")})`)
      )
    );

    return {
      ...contract,
      storage: stateCopy,
    };
  } catch (e) {
    console.log(e);
  }
};

export { SmartContract, hashSmartContract, callSmartContract };
