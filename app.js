import express from "express";
import { createServer } from "http";
import bodyParser from "body-parser";
import * as dotenv from 'dotenv';

import { handleGetRequest, handlePostRequest } from "./routes/index.js";

dotenv.config();

const app = express();

app.use(bodyParser.json());

app.get("/", handleGetRequest);
app.post("/", handlePostRequest);

const server = createServer(app);

const startServer = async () => {
  try {
    server.listen(3000, () => {
      console.log(`Server listening on port http://localhost:${3000}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
