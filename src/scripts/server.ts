import { Server } from "../server/server";

const main = async () => {
  const server = new Server();
  server.start();
};

main().catch(console.error);
