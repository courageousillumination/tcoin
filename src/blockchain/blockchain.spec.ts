import { Blockchain } from "./blockchain";
import { EmptyTransactionManager } from "./transaction/emptyTransaction";

describe("blockchain", () => {
  it("mines a new block", async () => {
    const blockchain = new Blockchain(new EmptyTransactionManager(), 1);
    const block = await blockchain.mineBlock(Infinity);
    await blockchain.mergeBlocks([...blockchain.getBlocks(), block]);
    expect(blockchain.getBlocks()).toHaveLength(2);
  });

  it("rejects an invalid block", async () => {
    const blockchain = new Blockchain(new EmptyTransactionManager());
    const block = blockchain.getBlocks()[0];
    await blockchain.mergeBlocks([block, block]);
    expect(blockchain.getBlocks()).toHaveLength(1);
  });
});
