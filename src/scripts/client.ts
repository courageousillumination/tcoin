import arg from "arg";
import { connectPeer, writePendingEntry } from "../client/client";

const main = async () => {
  const args = arg({
    "--write": String,
    "--peer": String,
  });

  if (args["--write"]) {
    await writePendingEntry("http://localhost:3000", {
      content: args["--write"],
    });
  } else if (args["--peer"]) {
    await connectPeer("http://localhost:3000", { peer: args["--peer"] });
  } else {
    console.log("Incorrect usage.");
  }
};

main().catch(console.error);
