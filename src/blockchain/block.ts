import { hash } from "../common/crypto";

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
}

/**
 * Produces a hash of a block.
 * @param block
 */
const hashBlock = (block: Block) => {
  return hash(
    block.header.previousHash +
      block.header.nonce.toString() +
      block.header.difficulty.toString()
  );
};

export { hashBlock, Block, BlockHeader };
