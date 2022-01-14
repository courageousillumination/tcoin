import crypto from "crypto";

/**
 * Hashes content (using SHA256) and returns a hex digest.
 * @param content
 * @returns
 */
const hash = (content: string) => {
  return crypto.createHash("sha256").update(content).digest("hex");
};

export { hash };
