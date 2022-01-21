interface TransactionManager<TTransaction = any, TData = any> {
  /**
   * Adds a new transaction to the manager.
   */
  addTransaction(transaction: TTransaction): Promise<boolean>;

  /**
   * Get all data that should be committed to the chain.
   */
  getDataToCommit(): TData;

  /** Get all pending data. */
  getPending(): TData;

  /**
   * Run a set of transactions (that have already been committed).
   * @param data
   */
  applyComitted(data: TData): Promise<boolean>;

  /**
   * Apply things that still need to be committed.
   */
  applyToCommit(data: TData): Promise<boolean>;

  /**
   * Creates a clone of this transaction manager, but with an empty data.
   */
  clone(): TransactionManager<TTransaction, TData>;
}

export { TransactionManager };
