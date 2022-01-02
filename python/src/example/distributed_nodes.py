from src.node import Node


def run_example():
    node1 = Node(1)
    node2 = Node(2)

    for _ in range(10):
        block = node1.find_new_block()
        node1.add_block(block)
        node2.add_block(block)
