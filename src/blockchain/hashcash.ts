/**
 * Count the leading zeros in a hash.
 * @param hash
 */
const countLeadingZeros = (hash: string) => {
  for (let i = 0; i < hash.length; i++) {
    if (hash[i] !== "0") {
      return i;
    }
  }
  return hash.length;
};

/**
 * Verifies that a hash meets the required proof of work.
 * @param hash
 * @param difficulty
 */
const verifyHashcash = (hash: string, difficulty: number) => {
  return countLeadingZeros(hash) >= difficulty;
};

/**
 * Find a nonce that verifies proof of work.
 * @param factory A function that generates a hash from a nonce.
 * @param difficulty
 * @param targetHashRate
 * @returns
 */
const findNonce = async (
  factory: (nonce: number) => string,
  difficulty: number,
  targetHashRate: number = Infinity
) => {
  let startTime = Date.now();
  for (let nonce = 0; ; nonce++) {
    if (verifyHashcash(factory(nonce), difficulty)) {
      return nonce;
    }
    // Apply rate limiting
    if (nonce % 1000 === 0 && isFinite(targetHashRate)) {
      const targetTime = startTime + 1000 / targetHashRate;
      const currentTime = Date.now();
      if (currentTime < targetTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, targetTime - currentTime)
        );
      }
      // Update the start time of the next iteration.
      startTime = Date.now();
    }
  }
};

export { verifyHashcash, findNonce };
