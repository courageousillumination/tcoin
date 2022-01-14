import arg from "arg";

import { startHttpServer } from "../server/httpServer";

const main = async () => {
  const args = arg({
    "--port": Number,
    "--host": String,
  });

  startHttpServer(args["--host"], args["--port"]);
};

main().catch(console.error);
