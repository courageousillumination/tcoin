import axios from "axios";
import { TCoinMessage } from "../protocol/messages";
import { Client } from "./client";

/**
 * A client that uses the simple HTTP /message endpoint for interaction.
 */
class HttpClient implements Client {
  /** @override */
  public async sendMessage(node: string, message: TCoinMessage) {
    const result = await axios.request({
      url: `${node}/message`,
      method: "POST",
      data: JSON.stringify(message),
      headers: { "Content-Type": "application/json" },
    });
    if (result.status == 201) {
      return null;
    } else {
      return result.data as TCoinMessage;
    }
  }

  /** @override */
  public async broadcast(nodes: string[], message: TCoinMessage) {
    nodes.map((node) => this.sendMessage(node, message));
  }
}

export { HttpClient };
