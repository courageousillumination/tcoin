import arg from "arg";
import { startHttpServer } from "../server/server";

const main = async () => {
  const args = arg({
    "--port": Number,
    "--peers": [String],
  });

  startHttpServer(args["--port"] || 3000, args["--peers"] || []);
};

main().catch(console.error);
