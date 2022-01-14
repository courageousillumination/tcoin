import { useState, useEffect, useCallback, useContext } from "react";
import { Client } from "../../client/client";

import { getPeersMessage } from "../../protocol/messages";
import { ClientContext } from "../contexts/clientContext";

interface Node {
  id: string;
  peers: string[];
}

interface Network {
  nodes: Node[];
}

/** Loads the latest state of the network. */
const loadNetwork = async (
  network: Network,
  client: Client
): Promise<Network> => {
  const nodes = network.nodes;
  // Create a new set and ask everyone on the network for new peers.
  const previousNodes = new Set(nodes.map((x) => x.id));
  const newNodes = [];

  const finalNodes = [];
  for (const node of nodes) {
    const nodeData: Node = { ...node };
    const result = await client.sendMessage(node.id, getPeersMessage());
    if (result?.type === "peers") {
      for (const peer of result.peers) {
        if (!previousNodes.has(peer)) {
          newNodes.push(peer);
        }
        nodeData.peers = result.peers;
      }
      finalNodes.push(nodeData);
    }
  }

  for (const id of newNodes) {
    const nodeData: Node = { id, peers: [] };
    finalNodes.push(nodeData);
  }

  // Now that we've generated the full node set we can actually fill in the data.
  return {
    nodes: finalNodes,
  };
};

const useLoadNetworkData = (initialNodes: string[]) => {
  const [network, setNetwork] = useState<Network>({
    nodes: initialNodes.map((id) => ({ id, peers: [] })),
  });

  const { client } = useContext(ClientContext);

  useEffect(() => {
    const interval = setInterval(async () => {
      const newNetwork = await loadNetwork(network, client);
      setNetwork(newNetwork);
    }, 2000);

    return () => clearInterval(interval);
  }, [network, setNetwork, client]);

  /** Custom function to add a node to the network. */
  const addNode = useCallback(
    (id: string) => {
      setNetwork((network) => ({
        ...network,
        nodes: [...network.nodes, { id, peers: [] }],
      }));
    },
    [setNetwork]
  );

  return { network, addNode };
};

export { useLoadNetworkData, Network };
