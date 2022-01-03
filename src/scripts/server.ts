import { startHttpServer } from "../server/server";

const main = async () => {
  startHttpServer(3000);
};

main().catch(console.error);
