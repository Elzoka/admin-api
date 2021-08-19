import express from "express";
import cors from "cors";
import helmet from "helmet";
import logger from "@/logger";
import config from "@/config";

// Constants
const { port, host } = config;

// App
const app = express();

// Essential middlewares
app.use(express.json()); // parse json body
app.use(cors()); // allowing Cross-Origin Resource Sharing
app.use(helmet()); // setting various header for security purposes

// Health Check
app.get("/healthcheck", (_, res) => res.status(200).end());

app.listen(port, () => {
  logger.info(`running on http://${host}:${port}`);
});
