import { TransactionManager } from "./transactionManager";

/**
 * A transaction manager that doesn't do anything.
 *
 * Mainly used for testing.
 */
class EmptyTransactionManager implements TransactionManager<never, null> {
  public async addTransaction(transaction: never) {
    return true;
  }

  public getDataToCommit() {
    return null;
  }
  public async applyComitted(data: null) {
    return true;
  }

  public async applyToCommit(data: null) {
    return true;
  }

  public getPending() {
    return null;
  }

  public clone() {
    return new EmptyTransactionManager();
  }
}

export { EmptyTransactionManager };
