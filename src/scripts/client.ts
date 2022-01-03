import arg from "arg";
import { Client } from "../client/client";

const main = async () => {
  const args = arg({
    "--write": String,
    "--read": String,
  });

  const client = new Client();
  await client.connect();

  if (args["--write"]) {
    const newId = await client.writeEntry(args["--write"]);
    console.log(`Wrote new entry, id=${newId}`);
  } else if (args["--read"]) {
    const content = await client.getEntry(args["--read"]);
    console.log(content);
  } else {
    console.log("Incorrect usage.");
  }
};

main().catch(console.error);
