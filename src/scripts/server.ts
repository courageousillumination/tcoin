import arg from "arg";
import { startHttpServer } from "../server/server";

const main = async () => {
  const args = arg({
    "--port": Number,
  });

  startHttpServer(args["--port"] || 3000);
};

main().catch(console.error);
