from src.ledger import Ledger


class Client:
    def __init__(self, ledger: Ledger):
        self.ledger = ledger

    def write_entry(self, content: str):
        """Writes a new entry to the ledger."""
        self.ledger.add_ledger_entry(content)
