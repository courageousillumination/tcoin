import { TransactionManager } from "./transactionManager";

/**
 * A transaction manager that doesn't do anything.
 *
 * Mainly used for testing.
 */
class EmptyTransactionManager implements TransactionManager<never, null> {
  /** @override */
  public async addTransaction(transaction: never) {
    return true;
  }

  /** @override */
  public async apply(commit: null) {
    return true;
  }

  /** @override */
  public async rollback(commit: null) {}

  /** @override */
  public async getCommit() {
    return null;
  }
}

export { EmptyTransactionManager };
