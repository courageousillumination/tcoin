# TCoin 0.2

The TCoin protocol supports the following messages:

- peers: All addresses of the network. Usually sent as a response to a getaddr, or when a new
  node joins the network and wants to broadcast its location. (addr in btc)
- getPeers: Request addresses on the network. (getaddr in btc)

To support ease of interaction, thes API has a REST wrapper

- POST /addr: Handles an addr message
- GET /addr:

For persistent connections, the sample implementaion also supports websockets and JSON
encoded messages.

# Notes

Is it actually worthwhile to make this connectionless. Stateless makes it easier to interact
with via `POST` but also makes it harder

# Legacy API documentation.

The TCoin API operates over HTTP using REST semantics. A compliant implementation of the TCoin server must expose the following endpoints:

- POST `/entries`: Creates a new entry in the Tcoin block chain. This entry will be added to the mempool, and may or may not be committed. Entries are uniquely identified by their content, so duplicate entries may be dropped.
  - Body format: `{content: string}`
  - Response: 201 on sucess, 400 if the entry is invalid.
- GET `/entries`: Get all entries that are currently in the mem pool.
- POST `/blocks`: Notify a node about a new block in the chain.
  - Body format: `{block: Block}`
  - Response: 201 on success, 400 if the block is invalid.
- GET `/blocks`: Returns all blocks known to the node.
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
  /** Hash of the previous block. */
  previousHash: string

  /** Nonce to ensure that this block hashes properly with the previous block. */
  nonce: string;

  /** Content contained in this block. *//
  content: T;
}
```
