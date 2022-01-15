import { Blockchain } from "../blockchain/blockchain";
import {
  createCoinbaseTransaction,
  Transaction,
  verifyTransaction,
} from "../blockchain/transaction";
import { Client } from "../client/client";
import { createKeyPair } from "../common/crypto";
import {
  TCoinMessage,
  PeersMessage,
  GetPeersMessage,
  VersionMessage,
  VersionAckMessage,
  versionAckMessage,
  versionMessage,
  peersMessage,
  errorMessage,
  BlocksMessage,
  GetBlocksMessage,
  blocksMessage,
  TransactionsMessage,
  transactionsMessage,
} from "../protocol/messages";

class TCoinServer {
  /** Current server version. Should only be incremented when the protocol changes. */
  private readonly version = 1;

  /**
   * Peers the server knows about.
   *
   * Peers will recieve broadcast transmissions from this server.
   */
  private readonly peers: string[] = [];

  /** Controls whether the node should be mining. */
  private shouldMine = false;

  /** Keys used by this server for mining. */
  private readonly keyPair = createKeyPair();

  /** A set of transactions that have not yet been committed. */
  private mempool: Transaction[] = [];

  constructor(
    private readonly address: string,
    private readonly client: Client,
    private readonly blockchain: Blockchain
  ) {
    console.log(this.keyPair);
  }

  public setShouldMining(shouldMine: boolean) {
    this.shouldMine = shouldMine;
    this.mine();
  }

  /**
   * Primary entry point for the TCoin server. Handles a message
   * by passing off to various sub-handlers.
   * @param message
   * @returns
   */
  public async handleMessage(
    message: TCoinMessage
  ): Promise<TCoinMessage | null> {
    switch (message.type) {
      case "peers":
        return this.handlePeers(message);
      case "getPeers":
        return this.handleGetPeers(message);
      case "version":
        return this.handleVersion(message);
      case "blocks":
        return this.handleBlocks(message);
      case "getBlocks":
        return this.handleGetBlocks(message);
      case "transactions":
        return this.handleTransactions(message);
      case "versionAck":
        // No response required.
        return null;
      default:
        return errorMessage(`Unknown message type ${message.type}`);
    }
  }

  /**
   * Handles a blocks message.
   *
   * The new blocks will be merged into the existing blockchain if possible.
   */
  private handleBlocks(message: BlocksMessage) {
    if (this.blockchain.mergeBlocks(message.blocks)) {
      // Update the mempool to only those that are not in the new blocks.
      // TODO: Need to go through and update the mempool to revalidate transactions.
      this.mempool = this.mempool.filter(
        (x) => this.blockchain.getTransaction(x.id) === null
      );

      // We sucessfully merged this in, let everyone else know.
      this.client.broadcast(
        this.peers,
        blocksMessage(this.blockchain.getBlocks())
      );
    }
    return null;
  }

  /**
   * Handles a transactions message. If the transactions are valid they are added
   * to the mempool for future commits.
   * @param message
   */
  private handleTransactions(message: TransactionsMessage) {
    for (const transaction of message.transactions) {
      if (this.mempool.find((x) => x.id === transaction.id)) {
        // We already know about this transaction, carry on.
        continue;
      }
      this.verifyTransaction(transaction);
    }
    return null;
  }

  /**
   * Verify that a transaction is valid. If so, add it to the mempool.
   * @param transaction
   */
  private async verifyTransaction(transaction: Transaction) {
    const verified = await verifyTransaction(
      transaction,
      this.blockchain.getTransactionAsync.bind(this.blockchain)
    );
    if (verified) {
      this.mempool.push(transaction);
      this.client.broadcast(this.peers, transactionsMessage([transaction]));
    }
  }

  /** Handle a get blocks message and returns all known blocks. */
  private handleGetBlocks(_message: GetBlocksMessage) {
    return blocksMessage(this.blockchain.getBlocks());
  }

  /**
   * Handles a notification about new peers.
   *
   * This server will attempt to contact each new peer with a handshake. If
   * this is sucessful, the new peer will be included on future broadcasts.
   */
  private handlePeers(message: PeersMessage) {
    for (const peer of message.peers) {
      if (!this.peers.includes(peer) && peer !== this.address) {
        this.handshake(peer);
      }
    }
    return null;
  }

  /**
   * Handles a request for all peers on this node.
   *
   * Responds with a PeersMessage.
   */
  private handleGetPeers(_message: GetPeersMessage): PeersMessage {
    return peersMessage(this.peers);
  }

  /**
   * Handles a version ack message.
   */
  private handleVersion(message: VersionMessage): VersionAckMessage | null {
    if (message.version === this.version) {
      return versionAckMessage();
    }
    return null;
  }

  /**
   * Performs a handshake with a peer.
   *
   * If successful the peer will be added to the peers list
   */
  private async handshake(peer: string) {
    const msg = versionMessage(this.version);
    const result = await this.client.sendMessage(peer, msg);
    if (result?.type === "versionAck") {
      this.peers.push(peer);
      // Let everyone else know that I've found a new peer on the network.
      // These could be coalesced, but peers joining/leaving should be pretty
      // rare.
      this.client.broadcast(this.peers, peersMessage([peer]));
    }
  }

  /**
   * Mines new blocks on this server.
   */
  private async mine() {
    while (this.shouldMine) {
      const coinbase = createCoinbaseTransaction(this.keyPair.pub, 1);
      const block = await this.blockchain.mineBlock([
        coinbase,
        ...this.mempool,
      ]);
      this.handleBlocks(blocksMessage([...this.blockchain.getBlocks(), block]));
    }
  }
}

export { TCoinServer };
