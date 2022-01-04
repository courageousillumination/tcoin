import { useEffect, useState } from "react";
import { Controls } from "./components/Controls";
import { NetworkSummary } from "./components/NetworkSummary";
import { NodeSummary } from "./components/NodeSummary";
import { Tabs } from "./components/Tabs";

const NODE_LOCATIONS = ["http://localhost:3000", "http://localhost:3001"];

const App = () => {
  const [nodes, setNodes] = useState<any[]>([]);

  useEffect(() => {
    setInterval(() => {
      const func = async () => {
        const newNodes: any[] = [];
        for (const loc of NODE_LOCATIONS) {
          const res = await fetch(`${loc}/block`);
          const blocks = await res.json();
          newNodes.push({
            location: loc,
            blocks,
          });
        }
        setNodes(newNodes);
      };
      func();
    }, 500);
  }, [setNodes]);

  const tabs = nodes.map((x, i) => ({
    title: `Node ${i}`,
    content: <NodeSummary node={x} />,
  }));

  return (
    <div>
      <Controls nodes={nodes} />
      <NetworkSummary nodes={nodes} />
      {tabs.length > 0 ? <Tabs tabs={tabs} /> : null}
    </div>
  );
};

export { App };
