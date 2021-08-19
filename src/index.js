import express from "express";
import cors from "cors";
import helmet from "helmet";
import "express-async-errors";
import logger from "@/logger";
import config from "@/config";
import error_handler from "@/errors/error_handler";
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

// Error handler
app.use(error_handler);

app.listen(port, () => {
  logger.info(`running on http://${host}:${port}`);
});
