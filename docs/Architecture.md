# TCoin architecture

So I'd like a way of setting up servers such that we can swap in a "real" or "fake"
implentation. So some kind of dependency injection schema.

Let's start with the block chain strategy -> mining strategy. Also, ideally a way to
seamlessly go between fs and in memory.

Ultimately I want to be able to "simulate" nodes using the same protocol I use to run
"real" nodes.
