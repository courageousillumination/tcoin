import { Block, hashBlock } from "./block";
import { findNonce, verifyHashcash } from "./hashcash";
import { Transaction, verifyTransaction } from "./transaction";

// TODO: Make this adjustable.
const DIFFICULTY = 3;

const GENESIS_BLOCK: Block = {
  header: {
    previousHash:
      "0000000000000000000000000000000000000000000000000000000000000000",
    nonce: 0,
    difficulty: 3,
  },
  content: [],
};

/**
 * A collection of blocks and operations that can be run over them.
 */
class Blockchain {
  protected blocks: Block[] = [GENESIS_BLOCK];

  /**
   * Get the blocks known to the blockchain.
   */
  public getBlocks() {
    return this.blocks;
  }

  /**
   * Merges a set of blocks into the blockchain.
   *
   * Returns true if the blockchain was updated and false otherwise.
   */
  public mergeBlocks(blocks: Block[]): boolean {
    if (hashBlock(this.blocks[0]) !== hashBlock(blocks[0])) {
      console.error("Incorrect genesis block");
      return false;
    }

    // Verify the other chain.
    for (let i = 1; i < blocks.length; i++) {
      const previousBlock = blocks[i - 1];
      const block = blocks[i];
      if (
        hashBlock(previousBlock) !== block.header.previousHash ||
        !this.verifyBlock(block)
      ) {
        console.error("Blockchain verification failed");
        return false;
      }
    }

    // Choose the longest chain
    // TODO: Choose the chain with the most work.
    if (blocks.length <= this.blocks.length) {
      return false;
    }

    this.blocks = blocks;
    return true;
  }

  /**
   * Mines a new block, using the head of the blockchain.
   */
  public async mineBlock(transactions: Transaction[]): Promise<Block> {
    const headBlock = this.blocks[this.blocks.length - 1];
    const previousHash = hashBlock(headBlock);
    const buildNewBlock = (nonce: number) => ({
      header: {
        previousHash,
        nonce,
        difficulty: DIFFICULTY,
      },
      content: transactions,
    });
    const nonce = await findNonce(
      (x) => hashBlock(buildNewBlock(x)),
      DIFFICULTY,
      1
    );
    return buildNewBlock(nonce);
  }

  /**
   * Verifies that a block is valid.
   */
  public async verifyBlock(block: Block): Promise<boolean> {
    if (!verifyHashcash(hashBlock(block), DIFFICULTY)) {
      return false;
    }

    // Verify all of the transactions are valid.
    // Skip the first one which is used for the coinbase transaction.
    // TODO: Validation of coinbase?
    for (const transaction of block.content.slice(1)) {
      if (
        !(await verifyTransaction(
          transaction,
          this.getTransactionAsync.bind(this)
        ))
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets a transaction by transaction id.
   * @param id
   * @returns
   */
  public getTransaction(id: string): Transaction | null {
    for (const block of this.blocks) {
      for (const transaction of block.content) {
        if (transaction.id === id) {
          return transaction;
        }
      }
    }
    return null;
  }

  /**
   * Async version of get transaction. Rejects if the transaction can not be found.
   * @param id
   * @returns
   */
  public async getTransactionAsync(id: string): Promise<Transaction> {
    const transaction = this.getTransaction(id);
    if (transaction === null) {
      throw new Error("Unknown transaction");
    }
    return transaction;
  }
}

export { Blockchain };
