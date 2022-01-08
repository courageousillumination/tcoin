import { Block } from "../../common/block";
import { Transaction } from "../../common/types";

interface BlockChainProps {
  blocks: Block<any>[];
}

const BlockComponent: React.FC<{
  block: Block<Transaction[]>;
  depth: number;
}> = ({ block, depth }) => {
  return (
    <table>
      <tbody>
        <tr>
          <td>Depth</td>
          <td>{depth}</td>
        </tr>
        <tr>
          <td>Nonce</td>
          <td>{block.nonce}</td>
        </tr>
        <tr>
          <td>Previous Hash</td>
          <td>{block.previousHash}</td>
        </tr>

        <tr>
          <td>Transactions</td>
          <td>
            <table>
              <tbody>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Dest</th>
                    <th>Amount</th>
                    <th>Signature</th>
                  </tr>
                </thead>
                {block.content.map((trans, i) => {
                  return (
                    <tr key={i}>
                      <td>{trans.source?.slice(0, 10)}</td>
                      <td>{trans.destination?.slice(0, 10)}</td>
                      <td>{trans.amount}</td>
                      <td>{trans.signature?.slice(0, 10)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

const BlockChain: React.FC<BlockChainProps> = ({ blocks }) => {
  return (
    <div>
      {blocks.map((x, i) => (
        <div key={i}>
          <BlockComponent block={x} depth={i} />
        </div>
      ))}
    </div>
  );
};

export { BlockChain };
