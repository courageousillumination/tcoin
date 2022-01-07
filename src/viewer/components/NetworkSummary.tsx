import { useEffect, useMemo, useState } from "react";
import { Graph } from "react-d3-graph";
import { getPeers } from "../../client/client";

/** Get a set of links for nodes (updated every second) */
const useNodeLinks = (nodes: string[]) => {
  const [links, setLinks] = useState<{ source: string; target: string }[]>([]);
  useEffect(() => {
    const i = setInterval(async () => {
      const peers = await Promise.all(nodes.map((node) => getPeers(node)));
      const newLinks = [];
      for (let i = 0; i < nodes.length; i++) {
        for (const peer of peers[i]) {
          newLinks.push({ source: nodes[i], target: peer });
        }
      }
      setLinks(newLinks);
    }, 1000);
    return () => {
      clearInterval(i);
    };
  }, [nodes, setLinks]);
  return links;
};

/**
 * A summary of the entire network.
 */
const NetworkSummary: React.FC<{ nodes: string[] }> = ({ nodes }) => {
  const links = useNodeLinks(nodes);
  const graphData = {
    nodes: nodes.map((id) => ({ id })),
    links,
  };

  return (
    <div>
      <table>
        <tbody>
          <tr>
            <td>Total Nodes in network</td>
            <td>{nodes.length}</td>
          </tr>
        </tbody>
      </table>

      {nodes.length > 0 ? (
        <Graph data={graphData} config={{}} id="network" />
      ) : null}
    </div>
  );
};

export { NetworkSummary };
