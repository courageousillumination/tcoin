import { Block } from "../../common/block";

interface BlockChainProps {
  blocks: Block<any>[];
}

const BlockComponent: React.FC<{ block: Block; depth: number }> = ({
  block,
  depth,
}) => {
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
          <td>Content</td>
          <td>
            <pre>{JSON.stringify(block.content)}</pre>
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
