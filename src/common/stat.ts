/**
 * A statistic value about the TCoin server.
 *
 * Mainly used for diagnostics.
 */
interface Stat {
  /** Name of the statistic. */
  name: string;

  /** Value of the statistic. */
  value: string | number;
}

export { Stat };
