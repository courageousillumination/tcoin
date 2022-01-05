import fetch from "node-fetch";
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
  method: string = "GET",
  body?: unknown
) => {
  const result = await fetch(`${server}${endpoint}`, {
    body: body ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
    method,
  });
  if (result.status == 201) {
    return null;
  } else {
    return result.json();
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

export { writePendingEntry, getPendingEntries, connectPeer };
