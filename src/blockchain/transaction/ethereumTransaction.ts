import {
  derivePublicKey,
  hash,
  sign,
  verifySignature,
} from "../../common/crypto";
import { Evaluator, ExecutionEnvironment } from "../../t-lisp/evaluate";
import { tokenize } from "../../t-lisp/tokenize";
import { parse } from "../../t-lisp/parse";
import { TransactionManager } from "./transactionManager";

/**
 * A transaction that resembles one on the ethereum network.
 */
interface BaseEthereumTransaction {
  /** Unique ID generated based on ID and nonce. */
  id: string;

  /** Public key of the sender of this transaction. */
  sender: string;

  /** Signature (based on the sender public key). */
  signature: string;

  /** Nonce to ensure that this transaction is unique. */
  nonce: number;
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
  /** Current state of all contracts. */
  contracts: SmartContract[];

  /** Transactions that are being committed. */
  transactions: EthereumTransaction[];
}

interface SmartContract {
  /** Unique ID for the smart contract. */
  id: string;

  /** Code for executing this contract. */
  code: string;

  /** Storage for the smart contract. */
  storage: Record<string, string>;
}

/**
 * Hash a transaction based on sender + nonce.
 * @param transaction
 * @returns
 */
const hashTransaction = (transaction: BaseEthereumTransaction) => {
  return hash(transaction.sender + transaction.nonce);
};

/**
 * Sets the ID on the transaction.
 * @param transaction
 * @returns
 */
function idTransaction<T extends BaseEthereumTransaction>(transaction: T): T {
  return { ...transaction, id: hashTransaction(transaction) };
}

/**
 * Get the signable part of a transaction.
 * @param transaction
 * @returns
 */
const getSignableTransaction = (
  transaction: BaseEthereumTransaction
): string => {
  return JSON.stringify({
    ...transaction,
    signature: "",
  });
};

/**
 * Create a new vaild transaction.
 * @param transaction
 * @param privKey
 * @returns
 */
async function createTransaction<
  T extends Omit<BaseEthereumTransaction, "id" | "signature" | "sender">
>(transaction: T, privKey: string): Promise<BaseEthereumTransaction> {
  const sender = derivePublicKey(privKey);
  let partial = {
    ...transaction,
    sender,
    id: "",
    signature: "",
  };
  const id = hashTransaction(partial);
  const signature = await sign(
    getSignableTransaction({ ...partial, id }),
    privKey
  );
  return {
    ...partial,
    signature,
    id,
  };
}

class EthereumTransactionManager
  implements TransactionManager<EthereumTransaction, State>
{
  /** Pending transactions that have not been committed yet. */
  private mempool: EthereumTransaction[] = [];

  /** Current state of all contracts. */
  private contracts: SmartContract[] = [];

  /** All committed transactions. */
  private transactions: EthereumTransaction[] = [];

  /** @override */
  public async addTransaction(
    transaction: EthereumTransaction
  ): Promise<boolean> {
    if (!(await this.validateTransaction(transaction))) {
      return false;
    }

    if (this.mempool.find((x) => x.id === transaction.id)) {
      return false;
    }

    this.mempool.push(transaction);
    return true;
  }

  /** @override */
  public async getCommit(): Promise<State> {
    await this.validateMempool();

    let contracts = this.contracts.slice();
    for (const transaction of this.mempool) {
      contracts = this.applyTransaction(transaction, contracts);
    }
    return {
      contracts,
      transactions: this.mempool.slice(),
    };
  }

  /** @override */
  public async apply(commit: State): Promise<boolean> {
    for (const transaction of commit.transactions) {
      if (!(await this.validateTransaction(transaction))) {
        return false;
      }
    }
    this.contracts = commit.contracts;
    this.transactions = this.transactions.concat(commit.transactions);
    return true;
  }

  /** @override */
  public async rollback(commit: State): Promise<void> {
    this.contracts = commit.contracts;
    for (const transaction of commit.transactions) {
      const old = this.transactions.pop();
      if (!old || old.id !== transaction.id) {
        console.warn("Rollback incorrectly applied.");
      }
    }
  }

  /**
   * Validate that a transaction is valid.
   * @param transaction
   */
  private async validateTransaction(transaction: EthereumTransaction) {
    // Make sure our ID is valid
    if (transaction.id !== hashTransaction(transaction)) {
      return false;
    }

    // Make sure the signature is valid
    if (
      !(await verifySignature(
        getSignableTransaction(transaction),
        transaction.signature,
        transaction.sender
      ))
    ) {
      return false;
    }

    // Make sure we haven't already registered this transaction.
    if (this.transactions.find((x) => x.id === transaction.id)) {
      return false;
    }

    // TODO: Actually run the transaction.

    return true;
  }

  /**
   * Validadte everything in the mempool.
   *
   * Discard transactions that are not valid.
   */
  private async validateMempool() {
    const newPool = [];
    for (const transaction of this.mempool) {
      if (await this.validateTransaction(transaction)) {
        newPool.push(transaction);
      }
    }
    this.mempool = newPool;
  }

  /**
   * Apply a transaction and return the new contract state.
   * @param transaction
   * @param contracts
   */
  private applyTransaction(
    transaction: EthereumTransaction,
    contracts: SmartContract[]
  ): SmartContract[] {
    if (transaction.type === "deployContract") {
      const contract = {
        id: transaction.id,
        code: transaction.code,
        storage: {},
      };
      return [...contracts, contract];
    } else if (transaction.type === "callContract") {
      const contract = contracts.find((x) => x.id === transaction.contract);
      if (!contract) {
        throw new Error("Could not find contract.");
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

      const newContract = { ...contract, storage: stateCopy };
      return [...contracts.filter((x) => x.id !== newContract.id), newContract];
    } else {
      throw new Error("Unhandled contract type");
    }
  }
}

export { EthereumTransaction, EthereumTransactionManager, createTransaction };
