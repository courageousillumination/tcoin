import { TCoinMessage } from "../protocol/messages";

/** Interface for a TCoin client protocol. */
interface Client {
  /** Sends a message to a single client. */
  sendMessage: (
    node: string,
    message: TCoinMessage
  ) => Promise<TCoinMessage | null>;

  /** Broadcasts a message to all clients. */
  broadcast: (nodes: string[], message: TCoinMessage) => Promise<void>;
}

export { Client };
