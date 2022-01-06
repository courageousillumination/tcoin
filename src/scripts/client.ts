import arg from "arg";
import { connectPeer, mineForever, writePendingEntry } from "../client/client";

const main = async () => {
  const args = arg({
    "--write": String,
    "--peer": String,
    "--mine": Boolean,
  });

  if (args["--write"]) {
    await writePendingEntry("http://localhost:3000", {
      content: args["--write"],
    });
  } else if (args["--peer"]) {
    await connectPeer("http://localhost:3000", { peer: args["--peer"] });
  } else if (args["--mine"]) {
    await mineForever("http://localhost:3000");
  } else {
    console.log("Incorrect usage.");
  }
};

main().catch(console.error);
