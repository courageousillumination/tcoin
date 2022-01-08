import { useState } from "react";
import { getBlocks, writePendingEntry } from "../../client/client";
import { signTransaction } from "../../common/transaction";
import { getAmountInWallet } from "../../common/wallet";
import { useNodeData } from "../hooks/useNodeData";

/** Demo data for a wallet
 *
 * Public: '048734241e5d4379408b0a7aa78fecffc7e987c90a3bc5110a502db21ceda26559a79d4360bedeec8c7f61b8eb465f4f47382b1bdd779b7f8cbc8e363455dd9203',
 * Private: '34e8b597bfbb3e62aeaed6616e136a75fbe54381e4016bde5251de89da8f2d7a'
 *
 */

const SendMoney: React.FC<{ node: string; pub: string; priv: string }> = ({
  node,
  pub,
  priv,
}) => {
  const [dest, setDest] = useState("");
  const [amount, setAmount] = useState(0);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const trans = await signTransaction(
          {
            source: pub,
            destination: dest,
            amount: amount,
            signature: null,
          },
          priv
        );
        writePendingEntry(node, trans);
      }}
    >
      <label>Destination</label>
      <input value={dest} onChange={(e) => setDest(e.target.value)} />
      <input
        value={amount}
        onChange={(e) => setAmount(parseInt(e.target.value))}
        type="number"
      />
      <button>Submit</button>
    </form>
  );
};

const WalletInternal: React.FC<{ node: string }> = ({ node }) => {
  const [walletPublic, setWalletPublic] = useState("");
  const [walletPrivate, setWalletPrivate] = useState("");
  // TODO: Remove this hardcoding.
  const blocks = useNodeData(node, getBlocks) as any;

  return (
    <div>
      <h1>Wallet</h1>
      <label>Public Key</label>
      <input
        value={walletPublic}
        onChange={(e) => setWalletPublic(e.target.value)}
      />
      <label>Private Key</label>
      <input
        value={walletPrivate}
        onChange={(e) => setWalletPrivate(e.target.value)}
      />
      {walletPublic ? (
        <div>
          <SendMoney node={node} pub={walletPublic} priv={walletPrivate} />
          <table>
            <tbody>
              <tr>
                <td>Wallet ID</td>
                <td>{walletPublic}</td>
              </tr>
              <tr>
                <td>Wallet Balance</td>
                <td>{getAmountInWallet(walletPublic, blocks)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

const Wallet: React.FC<{ nodes: string[] }> = ({ nodes }) => {
  if (nodes.length === 0) {
    return <div>Need at least one node.</div>;
  } else {
    return <WalletInternal node={nodes[0]} />;
  }
};

export { Wallet };
