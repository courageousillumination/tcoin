import { hash } from "../common/crypto";
import { Transaction } from "./transaction";

/**
 * Block header includes metadata about a block.
 */
interface BlockHeader {
  /** Hash of the previosu block in the chain. */
  previousHash: string;

  /** Nonce used as part of proof of work. */
  nonce: number;

  /** Difficulty of this block. */
  difficulty: number;
}

/**
 * A single block in the block chain.
 */
interface Block {
  /** Header information for the block. */
  header: BlockHeader;

  /** Content of the block is going to be a series of transactions. */
  content: Transaction[];
}

/**
 * Produces a hash of a block.
 * @param block
 */
const hashBlock = (block: Block) => {
  return hash(
    block.header.previousHash +
      block.header.nonce.toString() +
      block.header.difficulty.toString() +
      // NOTE: This is going to add a bunch of extra JSON. Bitcoin
      // encodes as a merkle tree and only computes the hash once. We'll
      // look into this for future iterations.
      JSON.stringify(block.content)
  );
};

export { hashBlock, Block, BlockHeader };
