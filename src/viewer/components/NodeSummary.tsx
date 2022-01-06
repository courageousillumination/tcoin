import { useEffect, useState } from "react";
import { getBlocks, getStats } from "../../client/client";
import { Block } from "../../common/block";
import { Stat } from "../../common/stat";
import { BlockChain } from "./BlockChain";
import { Stats } from "./Stats";
import { Tabs } from "./Tabs";

interface NodeProps {
  node: string;
}

const useNodeData = (node: string, func: (node: string) => unknown) => {
  const [data, setData] = useState<unknown>();
  useEffect(() => {
    setInterval(async () => {
      const d = await func(node);
      setData(d);
    }, 1000);
  }, [node, setData]);
  return data;
};

const NodeSummary: React.FC<NodeProps> = ({ node }) => {
  const blocks = useNodeData(node, getBlocks) as Block[];
  const stats = useNodeData(node, getStats) as Stat[];

  return (
    <Tabs
      tabs={[
        { title: "Blockchain", content: <BlockChain blocks={blocks || []} /> },
        { title: "Stats", content: <Stats stats={stats} /> },
      ]}
    />
  );
};
export { NodeSummary };
