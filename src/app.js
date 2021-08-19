import { Server } from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import "express-async-errors";
import error_handler from "@/errors/error_handler";

// App
const app = express();

// Essential middlewares
app.use(express.json()); // parse json body
app.use(cors()); // allowing Cross-Origin Resource Sharing
app.use(helmet()); // setting various header for security purposes

// Health Check
app.get("/healthcheck", (_, res) => {
  res.status(200).end();
});

// Error handler
app.use(error_handler);

/**
 *
 * @param {number} port
 * @returns {Server}
 */
export function init_server(port) {
  if (!port) {
    throw new Error(`invalid server port ${port}`);
  }

  return new Promise((resolve) => {
    const server = app.listen(port, () => resolve(server));
  });
}

export default app;
