import { useState } from "react";
import { Controls } from "./components/Controls";
import { NetworkSummary } from "./components/NetworkSummary";
import { NodeSummary } from "./components/NodeSummary";
import { Tabs } from "./components/Tabs";
import { Wallet } from "./components/Wallet";

const App = () => {
  const [nodes, setNodes] = useState<string[]>([]);
  const tabs = [
    {
      title: "Network Summary",
      content: <NetworkSummary nodes={nodes} />,
    },
    {
      title: "Wallet Explorer",
      content: <Wallet nodes={nodes} />,
    },

    ...nodes.map((x) => ({
      title: `Node at ${x}`,
      content: <NodeSummary node={x} />,
    })),
  ];

  return (
    <div>
      <Controls nodes={nodes} setNodes={setNodes} />
      <div style={{ margin: 24 }} />
      <Tabs tabs={tabs} />
    </div>
  );
};

export { App };
