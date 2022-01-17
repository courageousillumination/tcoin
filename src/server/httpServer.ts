import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { Blockchain } from "../blockchain/blockchain";

import { HttpClient } from "../client/httpClient";

import { TCoinServer } from "./server";

/**
 * Starts a TCoin server using HTTP as the primary communication pathway.
 */
const startHttpServer = (
  host: string = "http://localhost",
  port: number = 3000
) => {
  const backend = new TCoinServer(
    `${host}:${port}`,
    new HttpClient(),
    new Blockchain()
  );
  // if (port === 3000) {
  //   backend.setShouldMining(true);
  // }
  const app = express();
  app.use(bodyParser.json());
  app.use(cors());

  app.post("/message", async (req, res) => {
    const message = req.body;
    const result = await backend.handleMessage(message);
    if (result !== null) {
      res.send(result);
    } else {
      res.set(201);
      res.send();
    }
  });

  app.listen(port, () =>
    console.log(`Started HTTP TCoin server at ${host}:${port}`)
  );
};

export { startHttpServer };
