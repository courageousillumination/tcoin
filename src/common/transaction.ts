import crypto from "crypto";
import eccrypto from "eccrypto";
import { Block } from "./block";
import { Transaction, PrivateKey } from "./types";
import { getAmountInWallet, createWallet } from "./wallet";

/**
 * Creates a digest from a transaction (for signing).
 *
 * WARNING: The digest currently only depends on the source and destitination
 * addresses. This makes it vulenrable to replay attacks. We'll need to address
 * this in a future iteration of the protocol.
 */
const digestTransaction = (transaction: Transaction) => {
  return crypto
    .createHash("sha256")
    .update(
      transaction.source +
        transaction.destination +
        transaction.amount.toString()
    )
    .digest("hex");
};

/** Sign a transaction with a private key. */
const signTransaction = async (
  transaction: Transaction,
  key: PrivateKey
): Promise<Transaction> => {
  // WARNING: This is currently succeptiable to replay attacks. Will need to figure out
  // how to mitigate that... Maybe by including a previous transaction hash?
  const message = Buffer.from(digestTransaction(transaction), "hex");
  const keyBuffer = Buffer.from(key, "hex");
  const sig = await eccrypto.sign(keyBuffer, message);
  return {
    ...transaction,
    signature: sig.toString("hex"),
  };
};

/** Verify a transaction with the public key. */
const verifyTransactionSignature = async (
  transaction: Transaction
): Promise<boolean> => {
  if (transaction.signature === null) {
    return false;
  }

  try {
    const keyBuffer = Buffer.from(transaction.source, "hex");
    const sigBuffer = Buffer.from(transaction.signature, "hex");
    const message = Buffer.from(digestTransaction(transaction), "hex");
    await eccrypto.verify(keyBuffer, message, sigBuffer);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Verify a transaction against the block chain.
 */
const verifyTransactionAmount = (
  transaction: Transaction,
  blockchain: Block<Transaction[]>[]
): Boolean => {
  return (
    getAmountInWallet(transaction.source, blockchain) >= transaction.amount
  );
};

/** Verify a transaction is valid at the given point in the block chain. */
const verifyTransaction = async (
  transaction: Transaction,
  blockchain: Block<Transaction[]>[]
) => {
  return (
    (await verifyTransactionSignature(transaction)) &&
    verifyTransactionAmount(transaction, blockchain)
  );
};

export {
  digestTransaction,
  createWallet,
  signTransaction,
  verifyTransactionSignature,
  verifyTransaction,
};
