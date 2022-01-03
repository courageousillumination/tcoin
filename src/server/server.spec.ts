import { Server } from "./server";

describe("Server", () => {
  describe("writing entries", () => {
    it("can be read", async () => {
      const server = new Server();
      const id = await server.writeEntry("content");
      expect(await server.getEntry(id)).toEqual("content (unconfirmed)");
    });

    it("commits entries", async () => {
      const server = new Server();
      const id = await server.writeEntry("content");
      await server.commitBlock();
      expect(await server.getEntry(id)).toEqual("content");
    });
  });
});
