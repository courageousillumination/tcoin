The TCoin API operates over HTTP using REST semantics. A compliant implementation of the TCoin server must expose the following endpoints:

- POST `/entries`: Creates a new entry in the Tcoin block chain. This entry will be added to the mempool, and may or may not be committed. Entries are uniquely identified by their content, so duplicate entries may be dropped.
  - Body format: `{content: string}`
  - Response: 201 on sucess, 400 if the entry is invalid.
- GET `/entries`: Get all entries that are currently in the mem pool.
- POST `/blocks`: Notify a node about a new block in the chain.
  - Body format: `{block: Block}`
  - Response: 201 on success, 400 if the block is invalid.
- GET `/blocks?from={id}`: Returns all blocks known to the node, since the given ID. If ID is omitted all blocks will be returned
  - Response: 200 `{blocks: Block[]}`
- POST `/peers`: Registers a new peer.
  - Body format: `{location: string}`
- GET `/peers`: Returns a list of all peers known to the server.
  - Response: 200 `{peers: string[]}`

A TCoin server _may_ also implement the following endpoints:

- GET `/stats`: Returns statistics about the TCoin server.
- POST `/control`: Allows various control messages.

Additional Datastructures:

```
interface Entry {
    content: string
}

interface Block {
  /** ID for this block. */
  id: string;

  /** Nonce to ensure that this block hashes properly with the previous block. */
  nonce: string;

  /** Content contained in this block. *//
  content: T;
}
```
