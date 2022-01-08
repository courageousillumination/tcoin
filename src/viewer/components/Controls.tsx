import { useState } from "react";
import { getPeers, mineForever, writePendingEntry } from "../../client/client";

interface ControlsProps {
  nodes: string[];
  setNodes: React.Dispatch<React.SetStateAction<string[]>>;
}

interface Props {
  setNodes: React.Dispatch<React.SetStateAction<string[]>>;
}

/** Control to add a new node to the viewer. */
const AddNode: React.FC<Props> = ({ setNodes }) => {
  const [value, setValue] = useState("http://localhost:3000");
  const addNode = async (node: string) => {
    const peers = await getPeers(node);
    setNodes((old) => {
      return [...new Set([...old, ...peers, node])];
    });
  };

  return (
    <div>
      <div>Add new Node</div>
      <input onChange={(e) => setValue(e.target.value)} value={value} />
      <button onClick={() => addNode(value)}>Add</button>
    </div>
  );
};

const StartMining: React.FC<{ nodes: string[] }> = ({ nodes }) => {
  const [node, setNode] = useState(nodes[0]);
  return (
    <div>
      <div>Start Mining</div>
      <div style={{ display: "flex", flexDirection: "row", gap: "8px" }}>
        <select value={`${node}`} onChange={(e) => setNode(e.target.value)}>
          <option>---</option>
          {nodes.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
        <button
          onClick={async () => {
            mineForever(node);
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

/** Renders controls for the TCoin viewer. */
const Controls: React.FC<ControlsProps> = ({ nodes, setNodes }) => {
  return (
    <div>
      <AddNode setNodes={setNodes} />
      <StartMining nodes={nodes} />
    </div>
  );
};
export { Controls };
