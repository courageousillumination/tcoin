import { findToken, verifyToken } from "./hashcash";

describe("hashcash", () => {
  it("can find a new token", async () => {
    expect(await findToken("foo", 2)).toEqual("78");
  });

  it("verifies a token", () => {
    expect(verifyToken("foo", "78", 2)).toBeTruthy();
  });
});
