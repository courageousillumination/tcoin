import crypto from "crypto";
import eccrypto from "eccrypto";

/**
 * Hashes content (using SHA256) and returns a hex digest.
 * @param content
 * @returns
 */
const hash = (content: string) => {
  return crypto.createHash("sha256").update(content).digest("hex");
};

/**
 * Digitally signs the content with an ECDSA key
 * @param content
 * @param key
 */
const sign = async (content: string, key: string): Promise<string> => {
  const msg = crypto.createHash("sha256").update(content).digest();
  const result = await eccrypto.sign(Buffer.from(key, "hex"), msg);
  return result.toString("hex");
};

/**
 * Verify that the signature can be generated with the key.
 * @param content
 * @param signature
 * @param key
 * @returns
 */
const verifySignature = async (
  content: string,
  signature: string,
  key: string
) => {
  const msg = crypto.createHash("sha256").update(content).digest();

  try {
    await eccrypto.verify(
      Buffer.from(key, "hex"),
      msg,
      Buffer.from(signature, "hex")
    );
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

/**
 * Creates a public/private key pair for signing.
 * @returns
 */
const createKeyPair = () => {
  const privateKey = eccrypto.generatePrivate();
  const publicKey = eccrypto.getPublic(privateKey);

  return {
    pub: publicKey.toString("hex"),
    priv: privateKey.toString("hex"),
  };
};

/**
 * Derives a public key from a private key.
 * @param privateKey
 */
const derivePublicKey = (privateKey: string): string => {
  return eccrypto.getPublic(Buffer.from(privateKey, "hex")).toString("hex");
};

export { hash, sign, verifySignature, createKeyPair, derivePublicKey };
