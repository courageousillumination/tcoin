interface TransactionManager<TTransaction = any, TCommit = any> {
  /**
   * Adds a new transaction to the manager.
   *
   * This will be verified, but it will not be committed. Returns
   * true if the transaction was accepted, and false otherwise.
   *
   * @param transaction
   * @returns
   */
  addTransaction(transaction: TTransaction): Promise<boolean>;

  /**
   * Rollsback a series of commits.
   *
   * These commits should have been applied to the transaction manager
   * previously.
   * @param commit
   * @returns
   */
  rollback(commit: TCommit): Promise<void>;

  /**
   * Applies a commit to the transaction manager.
   *
   * @param commit
   * @returns true if the commit applies sucessfully.
   */
  apply(commit: TCommit): Promise<boolean>;

  /**
   * Gets the current data that should be committed.
   * @returns
   */
  getCommit(): Promise<TCommit>;
}

export { TransactionManager };
