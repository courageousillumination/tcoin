import express, { IRouter, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Block } from "../common/block";
import { Entry } from "../common/entry";
import { Stat } from "../common/stat";
import { connectPeer, writePendingEntry } from "../client/client";

/**
 * A fully compliant TCoin server.
 */
class Server {
  /** Known peers. */
  private readonly peers: string[] = [];

  /** Entries that have been validated, but not committed. */
  private mempool: Entry[] = [];

  constructor(private readonly location: string) {}

  /**
   * Adds a new entry, in the pending state.
   *
   * A new entry will be broadcast to all peers. A server will deduplicate entries
   * based on the content of that entry.
   */
  public async addPendingEntry(entry: Entry) {
    const found = this.mempool.find((x) => x.content === entry.content);
    if (!found) {
      this.mempool.push(entry);
      this.mapPeers((peer) => writePendingEntry(peer, entry));
    }
  }

  /**
   * Returns all items in the mempool (pending entries).
   * @returns
   */
  public async getPendingEntries(): Promise<Entry[]> {
    return this.mempool;
  }

  /**
   * Commits a block to the block chain.
   *
   * This will first validate the block as part of this chain, and, if valid
   * add it to the current chain. If the commit is sucessful it will be broadcast to all
   * peers, and all pending entries will be removed from the mempool.
   * @param block
   */
  public async commitBlock(block: Block) {}

  /**
   * Returns all blocks sinces id.
   *
   * If id is omitted, all blocks will be returned.
   * @param id
   */
  public async getBlocks(id?: string): Promise<Block[]> {
    return [];
  }

  /**
   * Registers a new peer with the server.
   *
   * This peer will recieve all broadcast updates going forward. Additionally, this server
   * will register itself as a peer.
   * @param peer
   */
  public async addPeer({ peer }: { peer: string }) {
    if (!this.peers.includes(peer)) {
      this.peers.push(peer);
      connectPeer(peer, { peer: this.location });
    }
  }

  /**
   * Returns a list of all known active peers.
   * @returns
   */
  public async getPeers(): Promise<string[]> {
    return this.peers;
  }

  /**
   * Gets active stats about the server.
   * @returns
   */
  public async getStats(): Promise<Stat[]> {
    return [
      { name: "mempool-size", value: this.mempool.length },
      { name: "peers", value: this.peers.length },
    ];
  }

  /**
   * Map a function over all peers.
   * @param func
   */
  private async mapPeers(func: (peer: string) => Promise<unknown>) {
    for (const peer of this.peers) {
      try {
        await func(peer);
      } catch (e) {
        console.warn("Issue with a peer", e);
      }
    }
  }
}

/**
 * Send data if it exists, otherwise set the response code to 201 and send nothing.
 */
const sendSafe = (res: Response, data: unknown) => {
  if (data === undefined || data === null) {
    res.status(201);
    res.send();
  } else {
    res.send(data);
  }
};

/** Connects a POST request with express. */
const connectPost = (
  app: IRouter,
  endpoint: string,
  func: (data: any) => Promise<any>
) => {
  app.post(endpoint, async (req, res) => sendSafe(res, await func(req.body)));
};

/** Connects a GET request with express. */
const connectGet = (
  app: IRouter,
  endpoint: string,
  func: () => Promise<any>
) => {
  app.get(endpoint, async (_, res) => sendSafe(res, await func()));
};

/** Start the server and run forever. */
const startHttpServer = (port: number) => {
  const server = new Server(`http://localhost:${port}`);

  const app = express();
  app.use(bodyParser.json());
  app.use(cors());

  connectPost(app, "/entries", (data) => server.addPendingEntry(data));
  connectGet(app, "/entries", () => server.getPendingEntries());
  connectPost(app, "/peers", (data) => server.addPeer(data));
  connectGet(app, "/peers", () => server.getPeers());
  connectGet(app, "/stats", () => server.getStats());
  app.listen(port, () => console.log(`Started server on port ${port}`));
};

export { Server, startHttpServer };
