// import { useContext, useMemo, useState } from "react";
// import { Block } from "../../blockchain/block";
// import {
//   getSignableTransaction,
//   hashTransaction,
//   Transaction,
//   TransactionInput,
//   TransactionOutput,
// } from "../../blockchain/transaction";
// import { derivePublicKey, sign } from "../../common/crypto";
// import {
//   BlocksMessage,
//   getBlocksMessage,
//   transactionsMessage,
// } from "../../protocol/messages";
// import { ClientContext } from "../contexts/clientContext";
// import { useMessage } from "../hooks/useMessage";

import { useContext, useEffect, useMemo, useState } from "react";
import { Block } from "../../blockchain/block";
import {
  BitcoinTransaction,
  getSignableTransaction,
  hashTransaction,
  TransactionInput,
  TransactionOutput,
} from "../../blockchain/transaction/bitcoinTransaction";
import { createKeyPair, derivePublicKey, sign } from "../../common/crypto";
import {
  BlocksMessage,
  getBlocksMessage,
  transactionsMessage,
} from "../../protocol/messages";
import { ClientContext } from "../contexts/clientContext";
import { useMessage } from "../hooks/useMessage";

const getUtxo = (blocks: Block<BitcoinTransaction[]>[], publicKey: string) => {
  const utxo: BitcoinTransaction[] = [];
  for (const block of blocks) {
    for (const transaction of block.content) {
      if (transaction.outputs.map((x) => x.publicKey).includes(publicKey)) {
        utxo.push(transaction);
      }
    }
  }

  // TODO: Remove all spent
  return utxo;
};
/**
 * Calculate the balance for a wallet.
 * @param blocks
 * @param publicKey
 * @returns
 */
const calculateBalance = (blocks: Block[], publicKey: string) => {
  let balance = 0;
  const utxo = getUtxo(blocks, publicKey);
  for (const transaction of utxo) {
    for (const output of transaction.outputs) {
      if (output.publicKey === publicKey) {
        balance += output.amount;
      }
    }
  }
  return balance;
};

const getInputs = (
  utxo: BitcoinTransaction[],
  publicKey: string,
  target: number
): [TransactionInput[], number] => {
  let totalFound = 0;
  const inputs: TransactionInput[] = [];
  for (const transaction of utxo) {
    for (let i = 0; i < transaction.outputs.length; i++) {
      const output = transaction.outputs[i];
      if (output.publicKey === publicKey) {
        totalFound += output.amount;

        inputs.push({
          previousTransaction: transaction.id,
          previousTransactionIndex: i,
          signature: "",
        });

        if (totalFound >= target) {
          return [inputs, totalFound];
        }
      }
    }
  }
  throw new Error("Could not find enough inputs");
};

const generateNewTransaction = async (
  blocks: Block[],
  publicKey: string,
  privateKey: string,
  sendTo: string,
  amount: number
) => {
  const utxo = getUtxo(blocks, publicKey);
  const [inputs, totalFound] = getInputs(utxo, publicKey, amount);

  const outputs: TransactionOutput[] = [
    {
      amount,
      publicKey: sendTo,
    },
  ];

  if (totalFound > amount) {
    outputs.push({
      amount: totalFound - amount,
      publicKey,
    });
  }

  const transaction: BitcoinTransaction = {
    id: "",
    inputs,
    outputs,
  };

  const signature = await sign(getSignableTransaction(transaction), privateKey);
  for (const input of transaction.inputs) {
    input.signature = signature;
  }
  const id = hashTransaction(transaction);
  return {
    ...transaction,
    id,
  };
};

const WalletInternal: React.FC<{ privateKey: string; blocks: Block[] }> = ({
  privateKey,
  blocks,
}) => {
  const publicKey = derivePublicKey(privateKey);
  const balance = calculateBalance(blocks, publicKey);
  const { client } = useContext(ClientContext);

  const [sendTo, setSendTo] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <div>
      <span>Balance: {balance}</span>
      <h1>Send Money</h1>
      <label>Send To</label>
      <input value={sendTo} onChange={(e) => setSendTo(e.target.value)} />
      <label>Amount</label>
      <input value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button
        onClick={async () => {
          const transaction = await generateNewTransaction(
            blocks,
            publicKey,
            privateKey,
            sendTo,
            parseInt(amount)
          );
          console.log(transaction);

          client.sendMessage(
            "http://localhost:3000",
            transactionsMessage([transaction])
          );
        }}
      >
        Send
      </button>
    </div>
  );
};

const Wallet: React.FC = () => {
  const [privateKey, setPrivateKey] = useState("");
  const message = useMemo(() => getBlocksMessage(), []);
  const result = useMessage<BlocksMessage>("http://localhost:3000", message);
  const blocks = result?.blocks;

  return (
    <div>
      <label>Private Key</label>
      <input
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
      />
      <button onClick={() => console.log(createKeyPair())}>Generate new</button>
      {privateKey && blocks ? (
        <WalletInternal privateKey={privateKey} blocks={blocks} />
      ) : null}
      <pre>{JSON.stringify(blocks, undefined, 4)}</pre>
    </div>
  );
};

export { Wallet };
