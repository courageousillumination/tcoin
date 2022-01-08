import { useEffect, useState } from "react";

export const useNodeData = (node: string, func: (node: string) => unknown) => {
  const [data, setData] = useState<unknown>();
  useEffect(() => {
    const i = setInterval(async () => {
      const d = await func(node);
      setData(d);
    }, 1000);
    return () => clearInterval(i);
  }, [node, setData]);
  return data;
};
