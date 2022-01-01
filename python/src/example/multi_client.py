from src.ledger import Ledger, pretty_print_ledger_entry
from src.client import Client


def run_example():
    l = Ledger()
    client1 = Client(l)
    client2 = Client(l)

    client1.write_entry("This is me saying something")
    client2.write_entry("This is from client 2")
    for entry in l.get_entries():
        pretty_print_ledger_entry(entry)
