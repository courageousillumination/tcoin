import crypto from "crypto";

/**
 * Count leading zeros in a string.
 * @param hash
 * @returns
 */
const countZeros = (hash: string): number => {
  for (let i = 0; i < hash.length; i++) {
    if (hash[i] !== "0") {
      return i;
    }
  }
  return hash.length;
};

/**
 * Does the core work of the hashcash algorithm.
 * @param fac A function to produce a hash given a nonce.
 * @param difficulty Target difficulty for the work.
 * @param targetHashRate A best effort hash rate (measured in kHashes / second)
 */
const doWork = async (
  fac: (nonce: number) => string,
  difficulty: number,
  targetHashRate: number = Infinity
) => {
  let startTime = Date.now();
  for (let nonce = 0; ; nonce++) {
    if (verifyHash(fac(nonce), difficulty)) {
      return nonce;
    }
    if (nonce % 1000 === 0 && isFinite(targetHashRate)) {
      const targetTime = startTime + 1000 / targetHashRate;
      const currentTime = Date.now();
      if (currentTime < targetTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, targetTime - currentTime)
        );
      }
      startTime = Date.now();
    }
  }
};

/**
 * Verify if a hash meets the requirements for a given difficulty level.
 * @param hash
 * @param difficulty
 * @returns
 */
const verifyHash = (hash: string, difficulty: number) =>
  countZeros(hash) >= difficulty;

/**
 * Gets the hash for a given string.
 * @param content
 * @returns
 */
const getHash = (content: string): string => {
  return crypto.createHash("sha256").update(content).digest("hex");
};

export { doWork, verifyHash, getHash };
