import { findToken, getHash, verifyToken } from "./hashcash";

const DIFFICULTY = 3;

interface Block<T = unknown> {
  id: number;
  nonce: string;
  content: T;
}

/** Hashs a block. */
const hashBlock = async (block: Block<unknown>): Promise<string> => {
  return getHash(JSON.stringify(block));
};

/** Works on a block and finds the correct nonce for the next block. */
const workOnBlock = async (
  block: Block<unknown>,
  slowdown: boolean
): Promise<string> => {
  return findToken(await hashBlock(block), DIFFICULTY, slowdown);
};

/** Validates that a list of blocks obey the protocol. */
const validateBlocks = async (blocks: Block[]): Promise<boolean> => {
  for (let i = 1; i < blocks.length; i++) {
    if (!isValidNextBlock(blocks[i], blocks[i - 1])) {
      return false;
    }
  }
  return true;
};

/** Checks that a block is a valid next block (has correct nonce). */
const isValidNextBlock = async (
  block: Block,
  previous: Block
): Promise<boolean> => {
  return verifyToken(await hashBlock(previous), block.nonce, DIFFICULTY);
};

export { Block, hashBlock, workOnBlock, validateBlocks, isValidNextBlock };
