import fetch from "node-fetch";

/**
 * A simple client for interacting with TCoin.
 */
class Client {
  private port: number | null = null;

  /** Connect the client to a specific server. */
  public async connect(port: number = 3000) {
    this.port = port;
  }

  /** Write an entry to the ledger. */
  public async writeEntry(entry: string): Promise<string> {
    if (this.port === null) {
      return Promise.reject("Not connected.");
    }
    const result = await fetch(`http://localhost:${this.port}/entry`, {
      body: JSON.stringify({ content: entry }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    return result.text();
  }

  /** Reads an entry from the ledger. */
  public async getEntry(id: string): Promise<string> {
    if (this.port === null) {
      return Promise.reject("Not connected.");
    }
    const result = await fetch(`http://localhost:${this.port}/entry/${id}`);
    return result.text();
  }
}

export { Client };
