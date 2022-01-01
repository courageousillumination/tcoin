from datetime import datetime

LedgerEntry = tuple[datetime, str]


def pretty_print_ledger_entry(entry: LedgerEntry):
    """Pretty printing for a ledger entry."""
    print(f"{entry[0].isoformat()}: {entry[1]}")


class Ledger:
    def __init__(self):
        self.entries: list[LedgerEntry] = []

    def add_ledger_entry(self, content: str):
        """Adds a new entry to the ledger."""
        entry = (datetime.now(), content)
        self.entries.append(entry)

    def get_entries(self) -> list[LedgerEntry]:
        """Get a list of entries currently in the ledger."""
        return self.entries
