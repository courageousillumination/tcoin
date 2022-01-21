import {
  TCoinMessage,
  getBlocksMessage,
  BlocksMessage,
  deploySmartContractMessage,
  callSmartContractMessage,
  transactionsMessage,
} from "../protocol/messages";
import { Client } from "../client/client";
import { TCoinServer } from "../server/server";
import { ClientContext } from "./contexts/clientContext";
import { useLoadNetworkData, Network } from "./hooks/network";
import { useContext, useEffect, useMemo, useState } from "react";
import { Blockchain } from "../blockchain/blockchain";
import { useMessage } from "./hooks/useMessage";
import { Block, hashBlock } from "../blockchain/block";
import { Wallet } from "./components/Wallet";
// import { Wallet } from "./components/Wallet";
// import { Transaction } from "../blockchain/transaction";

// const SendMessage: React.FC = () => {
//   const [node, setNode] = useState("");
//   const [message, setMessage] = useState("");
//   const { client } = useContext(ClientContext);
//   return (
//     <form
//       onSubmit={(e) => {
//         e.preventDefault();
//         client.sendMessage(node, JSON.parse(message));
//       }}
//     >
//       <h3>Send Message</h3>
//       <label>Node</label>
//       <input value={node} onChange={(e) => setNode(e.target.value)} />
//       <label>Message</label>
//       <input value={message} onChange={(e) => setMessage(e.target.value)} />
//       <button>Send</button>
//     </form>
//   );
// };

// const NodeSummary: React.FC<{ node: string }> = ({ node }) => {
//   const message = useMemo(() => getBlocksMessage(), []);
//   const blocks = useMessage<BlocksMessage>(node, message);
//   if (blocks === null) {
//     return <div>Loading...</div>;
//   }
//   return <pre>{JSON.stringify(blocks, undefined, 4)}</pre>;
// };

// const NetworkComponent: React.FC<{ network: Network }> = ({ network }) => {
//   return (
//     <div>
//       <SendMessage />
//       {network.nodes.map((node) => {
//         return <NodeSummary node={node.id} />;
//       })}
//     </div>
//   );
// };

// const SandboxedApp = () => {
//   const { network } = useLoadNetworkData(["Node 0"]);
//   return <NetworkComponent network={network} />;
// };

// const RealApp = () => {
//   const { network } = useLoadNetworkData(["http://localhost:3000"]);
//   return <NetworkComponent network={network} />;
// };

// class Sandbox {
//   private nextNodeId = 0;
//   private readonly nodes: Map<string, TCoinServer> = new Map();
//   private readonly minerPromises: Map<string, any> = new Map();

//   public getClient(): Client {
//     const sendMessage = (id: string, message: TCoinMessage) => {
//       const node = this.nodes.get(id);
//       if (!node) {
//         return Promise.reject("Unknown node");
//       }
//       return node.handleMessage(message);
//     };

//     const broadcast = async (nodes: string[], message: TCoinMessage) => {
//       nodes.map((node) => sendMessage(node, message));
//     };
//     return {
//       sendMessage,
//       broadcast,
//     };
//   }

//   public addNode() {
//     const id = `Node ${this.nextNodeId}`;
//     this.nextNodeId += 1;

//     const promiseFactory = () => {
//       return new Promise((resolve) => {
//         this.minerPromises.set(id, resolve);
//       });
//     };

//     const server = new TCoinServer(
//       id,
//       this.getClient(),
//       new MockBlockchain(promiseFactory)
//     );
//     this.nodes.set(id, server);
//     server.setShouldMining(true);
//   }

//   public mineBlock(node: string) {
//     const resolver = this.minerPromises.get(node);
//     if (resolver) {
//       resolver();
//     }
//   }
// }

// class MockBlockchain extends Blockchain {
//   constructor(private readonly promiseFactory: () => Promise<unknown>) {
//     super();
//   }

//   /**
//    * Automatically mines a new block every second.
//    * @returns
//    */
//   public async mineBlock(transactions: Transaction[]): Promise<Block> {
//     const headBlock = this.blocks[this.blocks.length - 1];
//     await this.promiseFactory();

//     return {
//       header: {
//         previousHash: hashBlock(headBlock),
//         nonce: 0,
//         difficulty: 0,
//       },
//       content: transactions,
//       contracts: [],
//     };
//   }

//   public verifyBlockHash(block: Block): boolean {
//     return block.header.nonce === 0;
//   }
// }

// const SANDBOX = new Sandbox();
// SANDBOX.addNode();

// const CONTRACT = `
// (begin
//   (define register-name
//     (lambda (key value)
//       (if (has-storage key)
//         0
//         (set-storage! key value))))
//   (define clear-name
//     (lambda (key)
//       (set-storage! key 0))))
// `;

// const SmartContractTest: React.FC = () => {
//   const { client } = useContext(ClientContext);
//   useEffect(() => {
//     const func = async () => {
//       await client.sendMessage(
//         "http://localhost:3000",
//         deploySmartContractMessage(CONTRACT)
//       );

//       await client.sendMessage(
//         "http://localhost:3000",
//         callSmartContractMessage(
//           "d7e75b4c81782d166ab4594e2b255a011bfff59c7be3ce501ef10663db193477",
//           "register-name",
//           ["tristan", 42]
//         )
//       );

//       await client.sendMessage(
//         "http://localhost:3000",
//         callSmartContractMessage(
//           "d7e75b4c81782d166ab4594e2b255a011bfff59c7be3ce501ef10663db193477",
//           "register-name",
//           ["tristan", "hacked"]
//         )
//       );

//       await client.sendMessage(
//         "http://localhost:3000",
//         callSmartContractMessage(
//           "d7e75b4c81782d166ab4594e2b255a011bfff59c7be3ce501ef10663db193477",
//           "clear-name",
//           ["tristan"]
//         )
//       );
//     };
//     func();
//   }, [client]);
//   return <div>Smart contract testing</div>;
// };

const App = () => {
  // return (
  //   <ClientContext.Provider value={{ client: SANDBOX.getClient() }}>
  //     <SandboxedApp />
  //     <button onClick={() => SANDBOX.mineBlock("Node 0")}>
  //       Mine a new block
  //     </button>
  //     <Wallet />
  //   </ClientContext.Provider>
  // );
  // return <RealApp />;

  return <Wallet />;
  // return <SmartContractTest />;
};

export { App };
