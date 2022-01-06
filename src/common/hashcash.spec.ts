import { doWork, getHash, verifyHash } from "./hashcash";

describe("hashcash", () => {
  it("can find a new token", async () => {
    expect(await doWork((nonce) => getHash("foo" + nonce), 2)).toEqual(78);
  });

  it("verifies a token", () => {
    expect(verifyHash(getHash("foo78"), 2)).toBeTruthy();
  });
});
