import { useContext, useState } from "react";
import { createTransaction } from "../../blockchain/transaction/ethereumTransaction";
import {
  BlocksMessage,
  getBlocksMessage,
  transactionsMessage,
} from "../../protocol/messages";
import { ClientContext } from "../contexts/clientContext";
import { useMessage } from "../hooks/useMessage";

const NODE = "http://localhost:3000";
const PRIVATE_KEY =
  "d28feb06cc38f414646e8c398ba081d4d41460477f748a43bacec59ed9ee206f";
const GET_BLOCKS = getBlocksMessage();

const DeployContract: React.FC = () => {
  const [code, setCode] = useState("");
  const { client } = useContext(ClientContext);
  return (
    <div>
      <textarea value={code} onChange={(e) => setCode(e.target.value)} />
      <button
        onClick={async () => {
          client.sendMessage(
            NODE,
            transactionsMessage([
              (await createTransaction(
                {
                  nonce: Math.random(),
                  type: "deployContract",
                  code,
                },
                PRIVATE_KEY
              )) as any,
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
        onClick={async () => {
          client.sendMessage(
            NODE,
            transactionsMessage([
              (await createTransaction(
                {
                  type: "callContract",
                  contract,
                  functionName,
                  args: JSON.parse(args),
                  nonce: Math.random(),
                },
                PRIVATE_KEY
              )) as any,
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
