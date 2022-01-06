import { doWork, getHash, verifyHash } from "./hashcash";

const DIFFICULTY = 3;

interface Block<T = unknown> {
  /** Hash of the previous block. */
  previousHash: string;

  /** Nonce to ensure proper hashing according to hashcash. */
  nonce: number;

  /** Content of the block. */
  content: T;
}

/**
 * Hashs a block.
 *
 * NOTE: This may not include all fields, so should be used consistently
 * for any block hashing.
 * @param block
 * @returns
 */
const hashBlock = (block: Block<unknown>): string => {
  return getHash(
    block.previousHash + `${block.nonce}` + JSON.stringify(block.content)
  );
};

/**
 * Mines a new block.
 *
 * Takes in a partial block and returns a corresponding block that has the
 * correct nonce.
 * @param block
 * @returns
 */
const mineBlock = async (
  block: Block<unknown>,
  hashRate?: number
): Promise<Block<unknown>> => {
  const nonce = await doWork(
    (nonce) => hashBlock({ ...block, nonce }),
    DIFFICULTY,
    hashRate
  );
  return { ...block, nonce };
};

/**
 * Validates that a list of blocks forms a proper blockchain.
 * @param blocks
 * @returns
 */
const validateBlocks = async (blocks: Block[]): Promise<boolean> => {
  for (let i = 1; i < blocks.length; i++) {
    if (!isValidNextBlock(blocks[i], blocks[i - 1])) {
      return false;
    }
  }
  return true;
};

/**
 * Validates that two adjacent blocks are valid.
 * @param block
 * @param previous
 * @returns
 */
const isValidNextBlock = async (
  block: Block,
  previous: Block
): Promise<boolean> => {
  return (
    block.previousHash === hashBlock(previous) &&
    verifyHash(hashBlock(block), DIFFICULTY)
  );
};

export { Block, hashBlock, mineBlock, validateBlocks, isValidNextBlock };
