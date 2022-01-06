import { useState } from "react";
import { Controls } from "./components/Controls";
import { NodeSummary } from "./components/NodeSummary";
import { Tabs } from "./components/Tabs";

const App = () => {
  const [nodes, setNodes] = useState<string[]>([]);
  const tabs = nodes.map((x) => ({
    title: `Node at ${x}`,
    content: <NodeSummary node={x} />,
  }));

  return (
    <div>
      <Controls nodes={nodes} setNodes={setNodes} />
      <div style={{ margin: 24 }} />
      {tabs.length > 0 ? <Tabs tabs={tabs} /> : null}
    </div>
  );
};

export { App };
