import { hash, verifySignature } from "../../common/crypto";
import { TransactionManager } from "./transactionManager";

interface BitcoinTransaction {
  /**
   * ID for this transaction.
   *
   * Should be generated by hashing the remainder of the transaction.
   */
  id: string;

  /** Inputs going into this transaction. */
  inputs: TransactionInput[];

  /** Outputs coming from this transaction. */
  outputs: TransactionOutput[];
}

interface TransactionInput {
  /** The transaction this one is based off. */
  previousTransaction: string;

  /** Index to find the exact output in the previous transaction. */
  previousTransactionIndex: number;

  /**
   * A signature for this transaction.
   *
   * See below for details about the signing, but generally this should cover
   * all non signature, non-id bytes of the transaction.
   */
  signature: string;
}

interface TransactionOutput {
  /** Number of TCoin to be transfered to the output. */
  amount: number;

  /**
   * Public key of the target address.
   * NOTE: Full bitcoin uses a scripting language here, but we're just simplifying.
   */
  publicKey: string;
}

/**
 * Gets the part of the transaction that should have a signature applied.
 *
 * This should return the entire body, except for the signature components
 * (since it's impossible to sign your own signature).
 * @param transaction
 */
const getSignableTransaction = (transaction: BitcoinTransaction): string => {
  return JSON.stringify({
    inputs: transaction.inputs.map((x) => ({
      previousTransaction: x.previousTransaction,
      previousTransactionIndex: x.previousTransactionIndex,
    })),
    outputs: transaction.outputs,
  });
};

/**
 * Create a hash of the transaction (used for unique IDs)
 * @param transaction
 * @returns
 */
const hashTransaction = (transaction: BitcoinTransaction) => {
  return hash(
    JSON.stringify({
      inputs: transaction.inputs,
      outputs: transaction.outputs,
    })
  );
};

class BitcoinTransactionManager
  implements TransactionManager<BitcoinTransaction, BitcoinTransaction[]>
{
  /** Transactions waiting to be committed. */
  private mempool: BitcoinTransaction[] = [];

  /**
   * All transactions (maybe make this just the UTXO?)
   */
  private allTransactions: BitcoinTransaction[] = [];

  /** @override */
  async addTransaction(transaction: BitcoinTransaction) {
    // Make sure the transaction is valid.
    if (!(await this.verifyTransaction(transaction))) {
      return false;
    }

    // Make sure we don't already know about this transaction.
    if (this.mempool.find((x) => x.id === transaction.id)) {
      return false;
    }

    this.mempool.push(transaction);
    this.allTransactions.push(transaction);
    return true;
  }

  /** @override */
  getDataToCommit() {
    return [this.createCoinbase(), ...this.mempool];
  }

  /** @override */
  getPending() {
    return [...this.mempool];
  }

  /** @override */
  async applyComitted(data: BitcoinTransaction[]) {
    // TODO: Check the coinbase transaction
    this.allTransactions.push(data[0]);
    for (const transaction of data.slice(1)) {
      if (!(await this.verifyTransaction(transaction))) {
        return false;
      }
      this.allTransactions.push(transaction);
    }
    return true;
  }

  /** @override */
  async applyToCommit(data: BitcoinTransaction[]) {
    for (const transaction of data) {
      if (!this.allTransactions.find((x) => x.id === transaction.id)) {
        // We haven't already committed, keep it in the mempool
        this.mempool.push(transaction);
      }
    }
    return true;
  }

  /** @override */
  public clone() {
    return new BitcoinTransactionManager();
  }

  /**
   * Find a a UTXO
   * @param id
   * @param index
   */
  private getUtxo(id: string, index: number): TransactionOutput | null {
    // Make sure it hasn't been used already
    for (const transaction of this.allTransactions) {
      for (const input of transaction.inputs) {
        if (
          input.previousTransaction === id &&
          input.previousTransactionIndex === index
        ) {
          return null;
        }
      }
    }

    // Now see if we can find it.
    for (const transaction of this.allTransactions) {
      if (transaction.id === id) {
        return transaction.outputs[index];
      }
    }
    return null;
  }

  /**
   * Verifies a transaction is valid.
   * @param transaction
   * @returns
   */
  private async verifyTransaction(transaction: BitcoinTransaction) {
    const outputs: TransactionOutput[] = [];
    for (const input of transaction.inputs) {
      const output = this.getUtxo(
        input.previousTransaction,
        input.previousTransactionIndex
      );
      if (output === null) {
        return false;
      }
      outputs.push(output);
    }

    // Verify that the amounts add up.
    const outputSum = transaction.outputs.reduce((acc, x) => acc + x.amount, 0);
    const inputSum = outputs.reduce((acc, x) => acc + x.amount, 0);

    // Add this back in just a second.
    if (outputSum !== inputSum) {
      return false;
    }

    // Verify that the signatures match.
    const transactionBody = getSignableTransaction(transaction);
    for (let i = 0; i < transaction.inputs.length; i++) {
      const input = transaction.inputs[i];
      const output = outputs[i];
      if (
        !(await verifySignature(
          transactionBody,
          input.signature,
          output.publicKey
        ))
      ) {
        return false;
      }
    }

    return true;
  }

  //   priv: "9fa64a170b24c8a5196a17d2593b44bed508f4b227c71823fd5816d3ccee9cbe"
  // pub: "04ed135fc903c97feda189d8cb7416dd87e8e19b0cec2705a969cbbd2fdbd0ad6cfc8fed7f0bd3ab20c5a82f53921cdbff3a6a16a4c8041e41925673250a7c9443"
  /**
   * Create a coinbase transaction.
   * @returns
   */
  private createCoinbase(): BitcoinTransaction {
    const transaction = {
      id: "",
      inputs: [],
      outputs: [
        {
          amount: 1000,
          publicKey:
            "04ed135fc903c97feda189d8cb7416dd87e8e19b0cec2705a969cbbd2fdbd0ad6cfc8fed7f0bd3ab20c5a82f53921cdbff3a6a16a4c8041e41925673250a7c9443",
        },
      ],
    };
    return {
      ...transaction,
      id: hashTransaction(transaction),
    };
  }
}

export {
  BitcoinTransaction,
  BitcoinTransactionManager,
  TransactionInput,
  TransactionOutput,
  hashTransaction,
  getSignableTransaction,
};
