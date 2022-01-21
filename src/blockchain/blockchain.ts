import { Block, hashBlock, idBlock } from "./block";
import { findNonce, verifyHashcash } from "./hashcash";
import { TransactionManager } from "./transaction/transactionManager";

class Blockchain<T = unknown> {
  /**
   * Current difficulty of the proof of work.
   */
  private readonly difficulty;

  /**
   * The entire blockchain, stored in memory.
   */
  private blocks: Block<T>[] = [];

  /**
   *
   * @param initialDifficulty Sets the initial difficulty for the blockchain.
   */
  constructor(
    private transactionManager: TransactionManager,
    initialDifficulty = 3
  ) {
    this.difficulty = initialDifficulty;
    // Create and push the gensis block.
    this.blocks.push(
      idBlock({
        nonce: 0,
        previousHash: "",
        difficulty: 1,
        content: this.transactionManager.getPending(),
      }) as any
    );
  }

  /**
   * Gets all blocks that have been committed to this block chain.
   *
   * NOTE: This does not include any pending transactions.
   * @returns
   */
  public getBlocks() {
    return this.blocks;
  }

  /**
   * Merges into the current blockchain.
   *
   * WARNING: Currently, this will require a full chain. It could use some
   * optimizations.
   * @param blocks
   * @returns true if the new blocks were accepted as the canonical chain.
   */
  public async mergeBlocks(blocks: Block<T>[]): Promise<boolean> {
    if (this.blocks[0].id !== blocks[0].id) {
      console.warn(
        "Attempted to merge a block with a different genesis block, aborting."
      );
      return false;
    }

    if (this.getTotalWork(this.blocks) >= this.getTotalWork(blocks)) {
      return false;
    }

    const newManager = await this.validateBlocks(blocks);
    if (newManager === null) {
      console.warn("Attempted to merge in an invalid chain.");
      return false;
    }
    // Make sure we don't drop the mempool
    // TODO: There needs to be a better way of handling this...
    newManager.applyToCommit(this.transactionManager.getPending());
    this.transactionManager = newManager;
    this.blocks = blocks;
    return true;
  }

  /**
   * Mines a new block (based on the current head).
   * @param content Content to encode in this block.
   * @param hashrate How many hashes should be tried, in 1000 hashes / second.
   * @returns
   */
  public async mineBlock(hashrate = 1): Promise<Block<unknown>> {
    const previousHash = this.getHead().id;
    const content = this.transactionManager.getDataToCommit();
    const buildNewBlock = (nonce: number) => ({
      previousHash,
      content,
      difficulty: this.difficulty,
      nonce,
    });
    const nonce = await findNonce(
      (x) => hashBlock(buildNewBlock(x)),
      this.difficulty,
      hashrate
    );

    return idBlock(buildNewBlock(nonce));
  }

  /**
   * Gets the total work of a blockchain.
   * @param blocks
   * @returns
   */
  public getTotalWork(blocks: Block<T>[]): number {
    let total = 0;
    for (const block of blocks) {
      total += block.difficulty;
    }
    return total;
  }

  /**
   * Add a transaction to the block chain.
   *
   * NOTE: This does not commit the transaction. It just registers intent
   * to do so. The transaction may still be dropped/delayed/etc.
   * @param transaction
   * @returns true if the transaction was accepted
   */
  public async addTransaction(transaction: T): Promise<boolean> {
    return this.transactionManager.addTransaction(transaction);
  }

  /**
   * Gets the current head of the blockchain.
   * @returns
   */
  private getHead(): Block<T> {
    return this.blocks[this.blocks.length - 1];
  }

  /**
   * Validates that a series of blocks forms a valid blockchain.
   *
   * NOTE: This assumes that the genesis block is valid.
   * WARNING: This will update the transaction manager
   * @param blocks
   * @returns
   */
  private async validateBlocks(
    blocks: Block<T>[]
  ): Promise<TransactionManager | null> {
    const newTransactionManager = this.transactionManager.clone();
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      console.log(blocks);
      if (hashBlock(block) !== block.id) {
        console.warn("Invalid block hash.");
        return null;
      }
      if (block.previousHash !== blocks[i - 1].id) {
        console.warn("Invalid previous hash");
        return null;
      }
      if (!verifyHashcash(block.id, block.difficulty)) {
        console.warn("Block does not match difficulty");
        return null;
      }

      if (!(await newTransactionManager.applyComitted(block.content))) {
        console.warn("Transaction validation failed");
        return null;
      }
    }
    return newTransactionManager;
  }
}

export { Blockchain };
