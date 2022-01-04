import { useState } from "react";

interface ControlsProps {
  nodes: any[];
}

const SendMessageControl: React.FC<{ nodes: any[] }> = ({ nodes }) => {
  const [message, setMessage] = useState("");
  const [node, setNode] = useState("0");
  return (
    <div>
      <span>Send Message</span>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <select value={`${node}`} onChange={(e) => setNode(e.target.value)}>
        {nodes.map((x, i) => (
          <option key={i} value={`${i}`}>
            {x.location}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          const n = nodes[parseInt(node)];
          fetch(`${n.location}/entry`, {
            body: JSON.stringify({ content: message }),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          });
          setMessage("");
        }}
      >
        Send
      </button>
    </div>
  );
};

const Controls: React.FC<ControlsProps> = ({ nodes }) => {
  return <SendMessageControl nodes={nodes} />;
};
export { Controls };
