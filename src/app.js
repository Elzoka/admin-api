import { Server } from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import "express-async-errors";
import error_handler from "@/errors/error_handler";
import model_controller from "@/controller/model";
import auth_controller from "@/controller/auth";
import profile_controller from "@/controller/profile";
import auth_middleware from "middleware/auth_middleware";

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

app.use("/auth", auth_controller);

app.use(auth_middleware);

app.use("/profile", profile_controller);
app.use("/:model_name", model_controller);

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
