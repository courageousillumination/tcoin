// Add two new messages:
// 1) deploySmartContract: That adds the smart contract to the current block.
// 2) callSmartContract: Look up and call the smart contract.

import { hash } from "../common/crypto";

interface SmartContract {
  /** Unique ID for this smart contract.  */
  id: string;

  /** Raw code for this contract. */
  code: string;

  /** State of the contract. */
  storage: Record<string, unknown>;
}

/**
 * Generates a hash for a smart contract.
 * @param contract
 * @returns
 */
const hashSmartContract = (contract: SmartContract) => {
  return hash(contract.code);
};

export { SmartContract, hashSmartContract };
