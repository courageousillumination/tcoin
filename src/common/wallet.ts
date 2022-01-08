import eccrypto from "eccrypto";
import { Block } from "./block";
import { Address, Transaction, PublicKey, PrivateKey } from "./types";

/** Gets the amount of money in a wallet. */
const getAmountInWallet = (
  address: Address,
  blockchain: Block<Transaction[]>[]
) => {
  let total = 0;
  for (const block of blockchain) {
    for (const transaction of block.content) {
      if (transaction.destination === address) {
        total += transaction.amount;
      } else if (transaction.source === address) {
        total -= transaction.amount;
      }
    }
  }
  return total;
};

/** Create a new wallet with both a public and private key. */
const createWallet = (): [PublicKey, PrivateKey] => {
  const priv = eccrypto.generatePrivate();
  const pub = eccrypto.getPublic(priv);
  return [pub.toString("hex"), priv.toString("hex")];
};

export { getAmountInWallet, createWallet };
