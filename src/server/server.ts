import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import cors from "cors";
import {
  Block,
  hashBlock,
  isValidNextBlock,
  workOnBlock,
} from "../common/block";

interface LedgerEntry {
  id: string;
  content: string;
}

type TCoinBlock = Block<LedgerEntry[]>;

// Allows the miner to slow down when mining.
const DEBUG_MINER = true;

const GENSIS_BLOCK: TCoinBlock = {
  id: 0,
  nonce: "",
  content: [],
};

/** A server for the TCoin protocol. */
class Server {
  private nextId = 0;
  private readonly ledger: TCoinBlock[] = [GENSIS_BLOCK];

  /** Entries that we have not yet committed. */
  private pendingEntries: LedgerEntry[] = [];

  constructor(
    private readonly id: number,
    private readonly peers: string[] = []
  ) {}

  /** Writes a new entry to the ledger. */
  public async writeEntry(content: string): Promise<string> {
    const id = `${this.nextId}`;
    this.pendingEntries.push({ id, content });
    this.nextId += 1;
    return id;
  }

  /**
   * Start the mining process.
   *
   * A mining server will continually look for new hashes to commit.
   */
  public async startMining() {
    while (true) {
      await this.mineBlock();
      // Publish to peers
      for (const peer of this.peers) {
        await fetch(`${peer}/block`, {
          body: JSON.stringify({ block: this.ledger[this.ledger.length - 1] }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
      }
    }
  }

  /** Do work to commit the current block. */
  public async mineBlock() {
    const headBlock = this.ledger[this.ledger.length - 1];
    const start = Date.now();
    const nonce = await workOnBlock(headBlock, DEBUG_MINER);
    const newBlock: TCoinBlock = {
      id: headBlock.id + 1,
      nonce,
      content: [
        { id: "-1", content: `Mined by ${this.id}` },
        ...this.pendingEntries.slice(),
      ],
    };
    if (await this.addBlock(newBlock)) {
      console.log(
        `Mined new block in ${(Date.now() - start) / 1000} seconds (${
          this.pendingEntries.length
        } transactions)`
      );
      this.pendingEntries = [];
    } else {
      console.log("Block invalidated.");
    }
  }

  /** Adds a new block to the block chain (including all contents data). */
  public async addBlock(block: TCoinBlock) {
    const headBlock = this.ledger[this.ledger.length - 1];
    if (await isValidNextBlock(block, headBlock)) {
      this.ledger.push(block);
      return true;
    }
    return false;
  }

  /** Gets an entry or the sentienl string "Not Found" */
  public async getEntry(id: string): Promise<string> {
    for (const block of this.ledger) {
      for (const entry of block.content) {
        if (entry.id === id) {
          return entry.content;
        }
      }
    }

    for (const entry of this.pendingEntries) {
      if (entry.id === id) {
        return entry.content + " (unconfirmed)";
      }
    }
    return "Not Found";
  }

  public getLedger() {
    return this.ledger;
  }

  /** Print the ledger to the console. */
  public printLedger() {
    console.log("Uncommitted entries");
    for (const entry of this.pendingEntries) {
      console.log(entry.id, entry.content);
    }

    for (const block of this.ledger) {
      console.log(`BLOCK ${block.id} (nonce=${block.nonce})`);
      for (const entry of block.content) {
        console.log(entry.id, entry.content);
      }
    }
  }
}

/** Start the server and run forever. */
const startHttpServer = (port: number, peers: string[]) => {
  const server = new Server(port, peers);

  const app = express();
  app.use(bodyParser.json());
  app.use(cors());

  // Write a new entry via POST.
  app.post("/entry", async (req, res) => {
    const content = req.body.content;
    const id = await server.writeEntry(content);
    console.log(`Wrote new entry, id=${id}, content=${content}`);
    res.send(id);
  });

  // Read an entry by ID
  app.get("/entry/:id", async (req, res) => {
    const content = await server.getEntry(req.params.id);
    res.send(content);
  });

  // Add a block from an external miner.
  app.post("/block", async (req, res) => {
    const block = req.body.block;
    await server.addBlock(block);
    res.status(201);
    res.send();
  });

  // Get the entire block chain.
  app.get("/block", async (req, res) => {
    res.send(server.getLedger());
  });

  // TODO: Make these debug endpoints POSTS
  // Debug endpoint for printing.
  app.get("/debug/print", async (_, res) => {
    server.printLedger();
    res.status(201);
    res.send();
  });

  app.get("/debug/start", async (_, res) => {
    server.startMining();
    res.status(201);
    res.send();
  });

  // Start serving the app.
  server.startMining(); // DON'T await this, it never returns.
  app.listen(port, () => console.log(`Started server on port ${port}`));
};

export { Server, startHttpServer };
