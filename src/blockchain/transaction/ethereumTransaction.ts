import { hash } from "../../common/crypto";
import { Evaluator, ExecutionEnvironment } from "../../t-lisp/evaluate";
import { tokenize } from "../../t-lisp/tokenize";
import { parse } from "../../t-lisp/parse";
import { TransactionManager } from "./transactionManager";

/**
 * A transaction that resembles one on the ethereum network.
 */
interface BaseEthereumTransaction {
  /** Public key of the sender of this transaction. */
  sender: string;

  /** Signature (based on the sender public key). */
  signature: string;
}

/**
 * A transaction to deploy a contract.
 */
interface DeployContractTransaction extends BaseEthereumTransaction {
  type: "deployContract";

  /** Raw code to be deployed for this contract. */
  code: string;
}

/**
 * A transaction to call an existing contract.
 */
interface CallContractTransaction extends BaseEthereumTransaction {
  type: "callContract";

  /** The unique ID for the contract. */
  contract: string;

  /** The function that should be called. */
  functionName: string;

  /** Arguments that should be passed to the function. */
  args: unknown[];
}

type EthereumTransaction = DeployContractTransaction | CallContractTransaction;

interface State {
  contracts: SmartContract[];
}

interface SmartContract {
  id: string;

  code: string;

  storage: Record<string, string>;
}

class EthereumTransactionManager
  implements TransactionManager<EthereumTransaction, State>
{
  private contracts: SmartContract[] = [];

  public async addTransaction(transaction: EthereumTransaction) {
    // TODO: Come back with actual verification.

    switch (transaction.type) {
      case "deployContract":
        return this.handleDeployContract(transaction);
      case "callContract":
        return this.handleCallContract(transaction);
      default:
        console.log("Unhandled transaction");
        return false;
    }
  }

  public getDataToCommit() {
    return {
      contracts: this.contracts,
    };
  }
  public async applyComitted(data: State) {
    this.contracts = data.contracts;
    return true;
  }

  public async applyToCommit(data: State) {
    this.contracts = data.contracts;
    return true;
  }

  public getPending() {
    return {
      contracts: this.contracts,
    };
  }

  public clone() {
    return new EthereumTransactionManager();
  }

  private handleDeployContract(transaction: DeployContractTransaction) {
    const contract: SmartContract = {
      code: transaction.code,
      id: hash(transaction.code), // TODO: Make this based on the sender...
      storage: {},
    };
    this.contracts.push(contract);
    return true;
  }

  private handleCallContract(transaction: CallContractTransaction) {
    const contract = this.contracts.find((x) => x.id === transaction.contract);
    if (!contract) {
      return false;
    }

    // Make a copy of the current storage.
    const stateCopy = { ...contract.storage };

    // Set up the execution environment to point to the state copy.
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
          tokenize(
            `(${transaction.functionName} ${transaction.args
              .map((x) => JSON.stringify(x))
              .join(" ")})`
          )
        )
      );

      contract.storage = stateCopy;
      return true;
    } catch (e) {
      console.log(e);
    }

    return false;
  }
}

export { EthereumTransaction, EthereumTransactionManager };
