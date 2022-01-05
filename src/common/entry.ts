/**
 * A single entry in the Tcoin block chain.
 *
 * A block contains 1 or more entries, which can have an arbitrary string content.
 */
interface Entry {
  content: string;
}

export { Entry };
