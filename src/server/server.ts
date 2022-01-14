import { Blockchain } from "../blockchain/blockchain";
import { Client } from "../client/client";
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

  constructor(
    private readonly address: string,
    private readonly client: Client,
    private readonly blockchain: Blockchain
  ) {}

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
      // We sucessfully merged this in, let everyone else know.
      this.client.broadcast(
        this.peers,
        blocksMessage(this.blockchain.getBlocks())
      );
    }
    return null;
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
   * Mine new blocks on this server.
   */
  private async mine() {
    while (this.shouldMine) {
      const block = await this.blockchain.mineBlock();
      this.handleBlocks(blocksMessage([...this.blockchain.getBlocks(), block]));
    }
  }
}

export { TCoinServer };
