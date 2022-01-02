import multiprocessing

from src.hashcash import verify, find_token


# Blocks are composed of a hash, the miner ID, and the nonce.
Block = tuple[str, int, int]

GENSIS_BLOCK: Block = ("", 0, 0)

DIFFICULTY = 4


def worker(block: Block, id: int):
    (hash, _, _) = block
    next_content = hash + str(id)
    hash, nonce = find_token(next_content.encode(), DIFFICULTY)
    return (hash, id, nonce)


class Node:
    def __init__(self, id: int):
        self.id = id
        self.peers: list["Node"] = []
        self.blocks: list[Block] = [GENSIS_BLOCK]
        self.worker = None

    def add_peer(self, peer: "Node"):
        self.peers.append(peer)

    # def start(self):
    #     p = multiprocessing.Process(target=worker, args=(self.blocks[-1],self.id))

    def find_new_block(self):
        (hash, _, _) = self.blocks[-1]
        next_content = hash + str(self.id)
        hash, nonce = find_token(next_content.encode(), DIFFICULTY)
        new_block = (hash, self.id, nonce)
        print(
            f"Node {self.id} found a new block: {hash}, {nonce}, chain={len(self.blocks)}"
        )
        return new_block

    def add_block(self, block: Block):
        if self.verify_block(block):
            self.blocks.append(block)

    def verify_block(self, block: Block):
        """Verifies a block against the current head of the chain."""
        (_, id, nonce) = block
        (hash, _, _) = self.blocks[-1]
        return verify((hash + str(id)).encode(), nonce, DIFFICULTY)
