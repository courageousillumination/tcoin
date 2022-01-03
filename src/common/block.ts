import { findToken, getHash } from "./hashcash";

const DIFFICULTY = 3;

interface Block<T = unknown> {
  id: string;
  previousHash: string;
  nonce: string;
  content: T;
}

/** Hashs a block. */
const hashBlock = async (block: Block<unknown>): Promise<string> => {
  return getHash(block.previousHash, block.nonce);
};

/** Works on a block and finds the correct nonce for the next block. */
const workOnBlock = async (block: Block<unknown>): Promise<string> => {
  console.log(await hashBlock(block));
  return findToken(await hashBlock(block), DIFFICULTY);
};

export { Block, hashBlock, workOnBlock };
