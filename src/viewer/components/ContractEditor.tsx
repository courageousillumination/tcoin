import { useContext, useState } from "react";
import {
  BlocksMessage,
  getBlocksMessage,
  transactionsMessage,
} from "../../protocol/messages";
import { ClientContext } from "../contexts/clientContext";
import { useMessage } from "../hooks/useMessage";

const NODE = "http://localhost:3000";
const GET_BLOCKS = getBlocksMessage();

const DeployContract: React.FC = () => {
  const [code, setCode] = useState("");
  const { client } = useContext(ClientContext);
  return (
    <div>
      <textarea value={code} onChange={(e) => setCode(e.target.value)} />
      <button
        onClick={() => {
          client.sendMessage(
            NODE,
            transactionsMessage([
              {
                sender: "",
                signature: "",
                type: "deployContract",
                code,
              },
            ])
          );
        }}
      >
        Deploy
      </button>
    </div>
  );
};

const CallContract: React.FC = () => {
  const [contract, setContract] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [args, setArgs] = useState("");
  const { client } = useContext(ClientContext);
  return (
    <div>
      <label>Contract</label>
      <input value={contract} onChange={(e) => setContract(e.target.value)} />
      <label>Function Name</label>
      <input
        value={functionName}
        onChange={(e) => setFunctionName(e.target.value)}
      />
      <label>Args</label>
      <input value={args} onChange={(e) => setArgs(e.target.value)} />
      <button
        onClick={() => {
          client.sendMessage(
            NODE,
            transactionsMessage([
              {
                sender: "",
                signature: "",
                type: "callContract",
                contract,
                functionName,
                args: JSON.parse(args),
              },
            ])
          );
        }}
      >
        Call
      </button>
    </div>
  );
};

const ContractEditor: React.FC = () => {
  const blocks = useMessage<BlocksMessage>(NODE, GET_BLOCKS);
  const contracts = blocks?.blocks[blocks.blocks.length - 1].content;
  return (
    <div>
      <DeployContract />
      <CallContract />
      <pre>{JSON.stringify(contracts, undefined, 4)}</pre>
    </div>
  );
};

export { ContractEditor };
