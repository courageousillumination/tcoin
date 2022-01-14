import { useContext, useEffect, useState } from "react";
import { TCoinMessage } from "../../protocol/messages";
import { ClientContext } from "../contexts/clientContext";

const INTERVAL = 2000;
/**
 * Returns the result of the message (updated a regular intervals.)
 * @param node
 * @param message
 */
function useMessage<T>(node: string, message: TCoinMessage) {
  const { client } = useContext(ClientContext);
  const [data, setData] = useState<T | null>();

  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await client.sendMessage(node, message);
      setData(result as T | null);
    }, INTERVAL);
    return () => clearInterval(interval);
  }, [client, setData, node, message]);

  return data;
}

export { useMessage };
