type PrivateKey = string;
type PublicKey = string;

/** A location that can "own" coins. Currently an ECDSA public key. */
type Address = PublicKey;

/** Represents a digital signature. Currenltly using the ECDSA algorithm. */
type Signature = string;

interface Transaction {
  /** Where the coins are coming from. */
  source: Address;

  /** Where the coins are going. */
  destination: Address;

  /** Size of the transaction */
  amount: number;

  /** Digitial signature from the source address */
  signature: Signature | null;
}

export { PublicKey, PrivateKey, Address, Signature, Transaction };
