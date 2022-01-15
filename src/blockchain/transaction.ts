import { hash, verifySignature } from "../common/crypto";

interface Transaction {
  /** Hash of the transaction. Used as an ID */
  id: string;

  /** Inputs going into this transaction. */
  inputs: TransactionInput[];

  /** Outputs coming from this transaction. */
  outputs: TransactionOutput[];

  /**
   * Arbitrary extra data for the coinebase; may be left off other transactions.
   * TODO: This is kind of a hack, because our miners are reusing their keys.
   * Might warrent some investigation.
   */
  coinbase?: string;
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

  // NOTE: Bitcoin uses a more comlpex scripting language here. For
  // right now, we'll just use keys for verification.

  /** Public key of the target address. */
  publicKey: string;
}

/**
 * Create a hash of the transaction (used for unique IDs)
 * @param transaction
 * @returns
 */
const hashTransaction = (transaction: Transaction) => {
  return hash(
    JSON.stringify({
      inputs: transaction.inputs,
      outputs: transaction.outputs,
      coinbase: transaction.coinbase,
    })
  );
};

/**
 * Verify a transaction is valid.
 *
 * There are three main steps here:
 *
 * 1. Gather all of the previous transactions that the inputs point to.
 * 2. Check that the sum of the outputs is equal to the sum of the inputs.
 * 3. Check that each input has a valid signature.
 *
 *
 * TODO: We need to actually prevent double spend. getTransaction should only pull
 * from the unspent transactions.
 *
 * @param transaction
 * @param getTransaction
 */
const verifyTransaction = async (
  transaction: Transaction,
  getTransaction: (id: string) => Promise<Transaction>
) => {
  const previousTransactions = await Promise.all(
    transaction.inputs.map((x) => getTransaction(x.previousTransaction))
  );

  const previousOutputs = previousTransactions.map(
    (x, i) => x.outputs[transaction.inputs[i].previousTransactionIndex]
  );

  // Verify that the amounts add up.
  const totalOutputAmount = transaction.outputs.reduce(
    (acc, x) => acc + x.amount,
    0
  );
  const totalInputAmount = previousOutputs.reduce(
    (acc, x) => acc + x.amount,
    0
  );

  if (totalOutputAmount !== totalInputAmount) {
    return false;
  }

  // Verify that the signatures match.
  const transactionBody = getSignableTransaction(transaction);
  for (let i = 0; i < transaction.inputs.length; i++) {
    const input = transaction.inputs[i];
    const output = previousOutputs[i];
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

  /** Everything else checks out. */
  return true;
};

/**
 * Gets the part of the transaction that should have a signature applied.
 *
 * This should return the entire body, except for the signature components
 * (since it's impossible to sign your own signature).
 * @param transaction
 */
const getSignableTransaction = (transaction: Transaction): string => {
  return JSON.stringify({
    inputs: transaction.inputs.map((x) => ({
      previousTransaction: x.previousTransaction,
      previousTransactionIndex: x.previousTransactionIndex,
    })),
    outputs: transaction.outputs,
    coinbase: transaction.coinbase,
  });
};

/**
 * Creates a new coinbase transaction (used for miners).
 * @param publicKey
 * @param amount
 * @returns
 */
const createCoinbaseTransaction = (
  publicKey: string,
  amount: number
): Transaction => {
  const baseTransaction: Transaction = {
    id: "",
    coinbase: Date.now().toString(),
    inputs: [],
    outputs: [{ amount, publicKey }],
  };
  const id = hashTransaction(baseTransaction);
  return {
    ...baseTransaction,
    id,
  };
};

export {
  Transaction,
  TransactionInput,
  TransactionOutput,
  hashTransaction,
  verifyTransaction,
  getSignableTransaction,
  createCoinbaseTransaction,
};
