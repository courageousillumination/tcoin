import arg from "arg";
import { HttpClient } from "../client/httpClient";

const main = async () => {
  const args = arg({
    "--message": String,
    "--port": Number,
    "--host": String,
  });

  const node = `${args["--host"] || "http://localhost"}:${
    args["--port"] || 3000
  }`;

  const client = new HttpClient();
  const response = await client.sendMessage(
    node,
    JSON.parse(args["--message"] || "")
  );
  console.log(response);
};

main().catch(console.error);
