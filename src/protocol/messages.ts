import { Block } from "../blockchain/block";
import { BitcoinTransaction } from "../blockchain/transaction/bitcoinTransaction";

type Transaction = BitcoinTransaction;

/**
 * A peers message notifies another node about the current version.
 *
 * Response: VersionAckMessage if the other node accepts the message.
 */
interface VersionMessage {
  type: "version";
  version: number;
}

/**
 * Indicates an error has occurred at the node.
 *
 * Response: None.
 */
interface ErrorMessage {
  type: "error";
  error: string;
}

/**
 * Sent in response to a VersionMessage.
 *
 * Response: None
 */
interface VersionAckMessage {
  type: "versionAck";
}

/**
 * A PeersMessage notifes a node about peers on the network.
 *
 * Response: None
 */
interface PeersMessage {
  type: "peers";
  peers: string[];
}

/**
 * A GetPeersMessage requests all peers from a node.
 *
 * Response: PeersMessage
 */
interface GetPeersMessage {
  type: "getPeers";
}

/**
 * A Blocks message delivers the entire set of blocks known to the server.
 *
 * Response: None
 *
 * TODO: This is probably overkill, but will work for now.
 */
interface BlocksMessage {
  type: "blocks";
  blocks: Block[];
}

/**
 * A GetBlocksMessage requests all blocks from the node.
 *
 * Response: BlocksMessage
 */
interface GetBlocksMessage {
  type: "getBlocks";
}

/**
 * Broadcast information about transactions.
 *
 * NOTE: This is usually used to send new transactions to the network. To get
 * verified transactions, check the blocks.
 *
 * Response: None
 */
interface TransactionsMessage {
  type: "transactions";
  // TODO: Make this generic somehow.
  transactions: Transaction[];
}

/**
 * Request a deployment of a smart contract.
 */
interface DeploySmartContractMessage {
  type: "deploySmartContract";
  code: string;
}

/**
 * Request a call of a SmartContract
 */
interface CallSmartContractMessage {
  type: "callSmartContract";
  id: string;
  func: string;
  args: unknown[];
}

/**
 * A TCoinMessage contains various information or commands for nodes on the TCoin network.
 */
type TCoinMessage =
  | PeersMessage
  | GetPeersMessage
  | VersionMessage
  | VersionAckMessage
  | BlocksMessage
  | GetBlocksMessage
  | ErrorMessage
  | TransactionsMessage
  | CallSmartContractMessage
  | DeploySmartContractMessage;

/** Generates a PeersMessage. */
const peersMessage = (peers: string[]): PeersMessage => ({
  type: "peers",
  peers,
});

/** Generates a GetPeersMessage. */
const getPeersMessage = (): GetPeersMessage => ({ type: "getPeers" });

/** Generates a VersionAckMessage. */
const versionAckMessage = (): VersionAckMessage => ({ type: "versionAck" });

/** Generates a VersionMessage. */
const versionMessage = (version: number): VersionMessage => ({
  type: "version",
  version,
});

/** Generates an ErrorMessage. */
const errorMessage = (error: string): ErrorMessage => ({
  type: "error",
  error,
});

/** Generates a BlocksMessage. */
const blocksMessage = (blocks: Block[]): BlocksMessage => ({
  type: "blocks",
  blocks,
});

/** Generates a GetBlocksMessage. */
const getBlocksMessage = (): GetBlocksMessage => ({
  type: "getBlocks",
});

/** Generates a TransactionsMessage. */
const transactionsMessage = (
  transactions: Transaction[]
): TransactionsMessage => ({
  type: "transactions",
  transactions,
});

/** Generates a deploy smart contract message. */
const deploySmartContractMessage = (
  code: string
): DeploySmartContractMessage => ({
  type: "deploySmartContract",
  code,
});

/** Generates a deploy smart contract message. */
const callSmartContractMessage = (
  id: string,
  func: string,
  args: unknown[]
): CallSmartContractMessage => ({
  type: "callSmartContract",
  id,
  func,
  args,
});

export {
  TCoinMessage,
  GetPeersMessage,
  PeersMessage,
  VersionMessage,
  VersionAckMessage,
  ErrorMessage,
  BlocksMessage,
  GetBlocksMessage,
  TransactionsMessage,
  DeploySmartContractMessage,
  CallSmartContractMessage,
  peersMessage,
  getPeersMessage,
  versionMessage,
  versionAckMessage,
  errorMessage,
  blocksMessage,
  getBlocksMessage,
  transactionsMessage,
  deploySmartContractMessage,
  callSmartContractMessage,
};
