import express from "express";
import bodyParser from "body-parser";

interface LedgerEntry {
  id: string;
  content: string;
}
class Server {
  private nextId = 0;
  private readonly ledger: LedgerEntry[] = [];

  /** Start the server and run forever. */
  public start(port: number = 3000) {
    const app = express();
    app.use(bodyParser.text());

    // Write a new entry via POST.
    app.post("/entry", async (req, res) => {
      const id = await this.writeEntry(req.body);
      res.send(id);
    });

    // Read an entry by ID
    app.get("/entry/:id", async (req, res) => {
      const content = await this.getEntry(req.params.id);
      res.send(content);
    });

    // Start serving the app.
    app.listen(port, () => console.log(`Started server on port ${port}`));
  }

  /** Writes a new entry to the ledger. */
  private async writeEntry(content: string): Promise<string> {
    const id = `${this.nextId}`;
    this.ledger.push({ id, content });
    this.nextId += 1;
    console.log(`Wrote new entry, id=${id}, content=${content}`);
    return id;
  }

  /** Gets an entry or the sentienl string "Not Found" */
  private async getEntry(id: string): Promise<string> {
    const entry = this.ledger.find((x) => x.id === id);
    return entry?.content || "Not Found";
  }
}

export { Server };
