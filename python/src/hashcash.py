"""
A simple implementation of the hash cash algorithm.
"""

import hashlib
import itertools


def count_zeros(digest: str):
    """Count the number of leading zeros in a hash string."""
    for i in range(len(digest)):
        if digest[i] != "0":
            return i
    return len(digest)


def find_token(content: bytes, leading_zeros: int) -> tuple[str, int]:
    """
    Finds a token that can be prepended to content to do proof of work.

    Currently parameterized by the number of leading zeros in the hex digest
    of the newly created hash.
    """

    for nonce in itertools.count(1):
        hash = hashlib.sha256(content + str(nonce).encode()).hexdigest()
        if count_zeros(hash) >= leading_zeros:
            return hash, nonce
    raise RuntimeError("Never happens")


def verify(content: bytes, nonce: int, leading_zeros: int):
    """
    Verify that a content meets the proof of work requirements.
    """
    hash = hashlib.sha256(content + str(nonce).encode()).hexdigest()
    return count_zeros(hash) >= leading_zeros
