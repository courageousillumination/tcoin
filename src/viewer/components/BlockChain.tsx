import { Block } from "../../common/block";

interface BlockChainProps {
  blocks: Block<any>[];
}

const BlockComponent: React.FC<{ block: Block }> = ({ block }) => {
  return (
    <div>
      <strong>Block {block.id}</strong>
      <pre>{JSON.stringify(block.content)}</pre>
    </div>
  );
};

const BlockChain: React.FC<BlockChainProps> = ({ blocks }) => {
  return (
    <div>
      {blocks.map((x) => (
        <BlockComponent block={x} key={x.id} />
      ))}
    </div>
  );
};

export { BlockChain };
