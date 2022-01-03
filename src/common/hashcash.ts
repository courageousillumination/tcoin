import crypto from "crypto";

/** Count leading zeros in a string. */
const countZeros = (hash: string): number => {
  for (let i = 0; i < hash.length; i++) {
    if (hash[i] !== "0") {
      return i;
    }
  }
  return hash.length;
};

/**
 * Produces a nonce that satisfies the hash cash algorithm
 *
 * Specifically, this will find a string that when concatenated with content
 * produces a hash that has at least `difficulty` leading zeros.
 */
const findToken = async (
  content: string,
  difficulty: number
): Promise<string> => {
  for (let nonce = 0; ; nonce++) {
    if (verifyToken(content, `${nonce}`, difficulty)) {
      return `${nonce}`;
    }
  }
};

/** Verify a token meets the requirements. */
const verifyToken = (
  content: string,
  nonce: string,
  difficulty: number
): boolean => {
  return countZeros(getHash(content, nonce)) >= difficulty;
};

/** Gets the hash for a content + nonce. */
const getHash = (content: string, nonce: string): string => {
  return crypto
    .createHash("sha256")
    .update(content + nonce)
    .digest("hex");
};

export { findToken, verifyToken, getHash };
