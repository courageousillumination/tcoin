import { Block } from "../../common/block";
import { BlockChain } from "./BlockChain";
import { Tabs } from "./Tabs";

interface NodeProps {
  node: { blocks: Block[] };
}

const NodeSummary: React.FC<NodeProps> = ({ node }) => {
  return (
    <Tabs
      tabs={[
        { title: "Blockchain", content: <BlockChain blocks={node.blocks} /> },
      ]}
    />
  );
};
export { NodeSummary };
