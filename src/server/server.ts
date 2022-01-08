import express, { IRouter, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import {
  Block,
  hashBlock,
  isValidNextBlock,
  mineBlock,
  validateBlocks,
} from "../common/block";
import { Stat } from "../common/stat";
import {
  syncChain,
  connectPeer,
  getBlocks,
  writePendingEntry,
} from "../client/client";
import { Transaction } from "../common/types";
import {
  createWallet,
  digestTransaction,
  verifyTransaction,
} from "../common/transaction";

const GENISIS_BLOCK = {
  previousHash:
    "0000000000000000000000000000000000000000000000000000000000000000",
  nonce: 0,
  content: [],
};

/**
 * A fully compliant TCoin server.
 */
class Server {
  /** Known peers. */
  private readonly peers: string[] = [];

  /** Entries that have been validated, but not committed. */
  private mempool: Transaction[] = [];

  /**
   * The blocks known to this server.
   *
   * NOTE: The latest block is at the head of the list.
   */
  private blocks: Block<Transaction[]>[] = [GENISIS_BLOCK];

  /** Hash rate when mining. */
  private hashRate: number = 1;

  private readonly wallet = createWallet();

  constructor(private readonly location: string) {
    // DO NOT DO THIS. It leaks private keys.
    console.log(this.wallet);
  }

  /**
   * Adds a new transaction to the mempool.
   *
   * A transaction will be added only if it is valid based on everything in the current blocks
   * TODO: We probably also need to check against all transactions in the mem pool?
   */
  public async addPendingEntry(transaction: Transaction) {
    const exists = this.mempool.find(
      (x) => digestTransaction(x) === digestTransaction(transaction)
    );
    if (!exists) {
      const isValid = await verifyTransaction(transaction, this.blocks);
      if (isValid) {
        this.mempool.push(transaction);
        this.mapPeers((peer) => writePendingEntry(peer, transaction));
      }
    }
  }

  /**
   * Returns all items in the mempool (pending entries).
   * @returns
   */
  public async getPendingEntries(): Promise<Transaction[]> {
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
  public async commitBlock(block: Block<Transaction[]>) {
    // TODO: Validate all of the transactions in the block.
    const isValid = await isValidNextBlock(block, this.blocks[0]);
    if (isValid) {
      this.blocks.unshift(block);
      // Remove all entries from the mempool

      this.mempool = this.mempool.filter(
        (x) =>
          !block.content.find(
            (y) => digestTransaction(x) === digestTransaction(y)
          )
      );
      // TODO: Need to verify all pending transactions at this point (or later...)

      // NOTE: This is very wasteful, since we are syncing the entire chain.
      // We may want to revisit this to ensure that we can send minimal deltas, but
      // that requires a lot of back and forth negotiation.
      this.mapPeers((peer) => syncChain(peer, this.blocks));
    }
  }

  /**
   * Sync the entire block chain.
   *
   * Will replace the current chain if the new chain is longer, valid,
   * and has the same genisis block.
   * @param blocks
   * @returns
   */
  public async syncChain(blocks: Block<Transaction[]>[]) {
    // Only accept new changes that are longer.
    if (this.blocks.length >= blocks.length) {
      return;
    }

    // Ensure that the genisis block is the same
    const genisisBlock1 = blocks[blocks.length - 1];
    const genisisBlock2 = this.blocks[this.blocks.length - 1];
    if (hashBlock(genisisBlock1) != hashBlock(genisisBlock2)) {
      return;
    }

    // Make sure the rest of the chain is valid
    if (!(await validateBlocks(blocks))) {
      return;
    }
    // TODO: Need to validate all transactions in blocks.

    // Everything looks good, so commit this.
    this.blocks = blocks;
  }

  /** Start mining on this server. Mining will run forever. */
  public async mineForever() {
    console.log("Starting mining...");
    while (true) {
      const startTime = Date.now();
      await this.mineBlock();
      console.log(
        `Mined a block in ${(Date.now() - startTime) / 1000} seconds`
      );
    }
  }

  /**
   * Attempt to mine a new block.
   */
  public async mineBlock() {
    const headBlock = this.blocks[0];
    const newBlock = await mineBlock(
      {
        previousHash: hashBlock(headBlock),
        nonce: 0, // This will be found.
        // Grab a copy of everything in the mempool and add a special "mined by notification."
        content: [
          // Coinbase transaction (a single coin per block.)
          {
            source: null,
            destination: this.wallet[0],
            amount: 1,
            signature: null,
          },
          ...this.mempool.slice(),
        ] as Transaction[],
      },
      this.hashRate
    );
    this.commitBlock(newBlock as Block<Transaction[]>);
  }

  /**
   * Returns all blocks
   */
  public async getBlocks(): Promise<Block[]> {
    return this.blocks;
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
      await connectPeer(peer, { peer: this.location });
      this.syncChain(await getBlocks(peer));
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
      { name: "hashrate", value: this.hashRate },
      { name: "chain-length", value: this.blocks.length },
    ];
  }

  /** Set the hash rate (if mining). */
  public setHashRate(hashRate: number) {
    this.hashRate = hashRate;
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
  connectGet(app, "/blocks", () => server.getBlocks());
  connectPost(app, "/blocks", (data) => server.syncChain(data));
  connectGet(app, "/peers", () => server.getPeers());
  connectGet(app, "/stats", () => server.getStats());
  connectPost(app, "/control/mine", () => {
    server.mineForever();
    return Promise.resolve();
  });

  app.listen(port, () => console.log(`Started server on port ${port}`));
};

export { Server, startHttpServer };
