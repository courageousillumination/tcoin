import axios from "axios"; // Used instead of fetch so I can use it in both node and browser.
import { Block } from "../common/block";
import { Entry } from "../common/entry";

type Server = string;

/**
 * Make a post request to the server and parse the result.
 * @param server
 * @param endpoint
 * @param body
 * @returns
 */
const makeRequest = async (
  server: Server,
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: unknown
) => {
  const result = await axios.request({
    url: `${server}${endpoint}`,
    method,
    data: body ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });

  if (result.status == 201) {
    return null;
  } else {
    return result.data;
  }
};

/**
 * Write a new entry to the server.
 * @param server
 * @param content
 * @returns
 */
const writePendingEntry = async (server: Server, entry: Entry) => {
  return makeRequest(server, "/entries", "POST", entry);
};

/**
 * Get all pending entries
 */
const getPendingEntries = async (server: Server) => {
  return makeRequest(server, "/entries");
};

/**
 * Connect a peer.
 */
const connectPeer = async (server: Server, peer: { peer: Server }) => {
  return makeRequest(server, "/peers", "POST", peer);
};

/**
 * Get all active peers.
 */
const getPeers = async (server: Server) => {
  return makeRequest(server, "/peers");
};

/**
 * Commit a new block to the block chain.
 */
const commitBlock = async (server: Server, block: Block) => {
  return makeRequest(server, "/blocks", "POST", block);
};

/**
 * Get all blocks from the server.
 */
const getBlocks = async (server: Server) => {
  return makeRequest(server, "/blocks");
};

/** Start a server mining. */
const mineForever = async (server: Server) => {
  return makeRequest(server, "/control/mine", "POST");
};

/** Start a server mining. */
const getStats = async (server: Server) => {
  return makeRequest(server, "/stats");
};

export {
  writePendingEntry,
  getPendingEntries,
  connectPeer,
  commitBlock,
  mineForever,
  getPeers,
  getBlocks,
  getStats,
};
