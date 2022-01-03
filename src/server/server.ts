import express from "express";
import bodyParser from "body-parser";
import { Block, hashBlock, workOnBlock } from "../common/block";

interface LedgerEntry {
  id: string;
  content: string;
}

type TCoinBlock = Block<LedgerEntry[]>;

const GENSIS_BLOCK: TCoinBlock = {
  id: "0",
  previousHash: "",
  nonce: "",
  content: [],
};

/** A server for the TCoin protocol. */
class Server {
  private nextId = 0;
  private readonly ledger: TCoinBlock[] = [GENSIS_BLOCK];

  /** Entries that we have not yet committed. */
  private pendingEntries: LedgerEntry[] = [];

  /** Writes a new entry to the ledger. */
  public async writeEntry(content: string): Promise<string> {
    const id = `${this.nextId}`;
    this.pendingEntries.push({ id, content });
    this.nextId += 1;
    return id;
  }

  /** Do work to commit the current block. */
  public async commitBlock() {
    const nonce = await workOnBlock(this.ledger[0]);
    const previousHash = await hashBlock(this.ledger[0]);
    const newBlock: TCoinBlock = {
      id: "N/A",
      nonce,
      previousHash,
      content: this.pendingEntries.slice(),
    };
    this.ledger.unshift(newBlock);
    this.pendingEntries = [];
    console.log("Commited new block");
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

  /** Print the ledger to the console. */
  public printLedger() {
    console.log("Uncommitted entries");
    for (const entry of this.pendingEntries) {
      console.log(entry.id, entry.content);
    }

    for (const block of this.ledger) {
      console.log(`BLOCK ${block.id} ${block.previousHash} ${block.nonce}`);
      for (const entry of block.content) {
        console.log(entry.id, entry.content);
      }
    }
  }
}

/** Start the server and run forever. */
const startHttpServer = (port: number) => {
  const server = new Server();

  const app = express();
  app.use(bodyParser.text());

  // Write a new entry via POST.
  app.post("/entry", async (req, res) => {
    const id = await server.writeEntry(req.body);
    console.log(`Wrote new entry, id=${id}, content=${req.body}`);
    res.send(id);
  });

  // Read an entry by ID
  app.get("/entry/:id", async (req, res) => {
    const content = await server.getEntry(req.params.id);
    res.send(content);
  });

  // TODO: Make these debug endpoints POSTS
  // Debug endpoint for printing.
  app.get("/debug/print", async (_, res) => {
    server.printLedger();
    res.status(201);
    res.send();
  });

  // Force the server to commit the current block.
  app.get("/debug/commit", async (_, res) => {
    await server.commitBlock();
    res.status(201);
    res.send();
  });

  // Start serving the app.
  app.listen(port, () => console.log(`Started server on port ${port}`));
};

export { Server, startHttpServer };
