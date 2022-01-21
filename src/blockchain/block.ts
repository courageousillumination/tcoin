import { hash } from "../common/crypto";

/**
 * A block for a proof-of-work blockchain.
 */
interface Block<T = any> {
  /** Unique ID for this block (generated via hash). */
  id: string;

  /** Hash of the previous block in the blockchain. */
  previousHash: string;

  /** Nonce for generating a correct hash. */
  nonce: number;

  /** Target difficulty for this block. */
  difficulty: number;

  /** Content of the block. */
  content: T;
}

/**
 * Produces a hash of a block.
 * @param block
 */
const hashBlock = (block: Omit<Block<unknown>, "id">) => {
  return hash(
    block.previousHash +
      block.nonce.toString() +
      block.difficulty.toString() +
      // NOTE: We may want to revist and only hash the merkle tree
      // roots (if we ever get around to that).
      JSON.stringify(block.content)
  );
};

/**
 * Creates a block with the correct ID.
 * @param block
 * @returns
 */
const idBlock = (block: Omit<Block<unknown>, "id">) => {
  return { ...block, id: hashBlock(block) };
};

export { hashBlock, Block, idBlock };
