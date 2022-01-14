import { Block, hashBlock } from "./block";
import { findNonce, verifyHashcash } from "./hashcash";

// TODO: Make this adjustable.
const DIFFICULTY = 3;

const GENESIS_BLOCK: Block = {
  header: {
    previousHash:
      "0000000000000000000000000000000000000000000000000000000000000000",
    nonce: 0,
    difficulty: 3,
  },
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
        !this.verifyBlockHash(block)
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
  public async mineBlock(): Promise<Block> {
    const headBlock = this.blocks[this.blocks.length - 1];
    const previousHash = hashBlock(headBlock);
    const buildNewBlock = (nonce: number) =>
      hashBlock({
        header: {
          previousHash,
          nonce,
          difficulty: DIFFICULTY,
        },
      });
    const nonce = await findNonce(buildNewBlock, DIFFICULTY, 1);
    return {
      header: {
        previousHash,
        nonce,
        difficulty: DIFFICULTY,
      },
    };
  }

  /**
   * Verifes that a block hashes properly.
   */
  public verifyBlockHash(block: Block): boolean {
    return verifyHashcash(hashBlock(block), DIFFICULTY);
  }
}

export { Blockchain };
