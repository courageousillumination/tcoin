import {
  createWallet,
  signTransaction,
  verifyTransactionSignature,
} from "./transaction";

describe("transactions", () => {
  describe("supports signing and verifying", () => {
    it("works for valid transactions", async () => {
      const [pub, priv] = createWallet();
      const trans = await signTransaction(
        {
          source: pub,
          destination: pub,
          amount: 1,
          signature: null,
        },
        priv
      );

      expect(await verifyTransactionSignature(trans)).toBeTruthy();
    });

    it("catches invalid transactions", async () => {
      const [pub, priv] = createWallet();
      expect(
        await verifyTransactionSignature({
          source: pub,
          destination: pub,
          amount: 1,
          signature: null,
        })
      ).toBeFalsy();

      // Test non hex strings
      expect(
        await verifyTransactionSignature({
          source: pub,
          destination: pub,
          amount: 1,
          signature: "!",
        })
      ).toBeFalsy();

      // Hex strings, but an invalid one.
      expect(
        await verifyTransactionSignature({
          source: pub,
          destination: pub,
          amount: 1,
          signature: "0",
        })
      ).toBeFalsy();
    });
  });
});
