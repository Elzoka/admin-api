import { init_database } from "@/db";
import config from "@/config";
import logger from "@/logger";
import { init_server } from "./app";
import { log_uncaught_error } from "errors/error_handler";

// Constants
const { port, host, mongodb_uri } = config;

/**
 *
 * @callback ErrorHandler
 * @param {Error} error
 * @returns {void|Promise<void>}
 *
 * @callback Handlers
 * @param  {...Handler} handlers
 * @returns {Handler}
 */
function handle_error(...handlers) {
  return (error) => handlers.forEach((handler) => handler(error));
}

async function bootstrap() {
  const cleanup_db = await init_database(mongodb_uri);
  logger.info(`connected to mongodb running on ${mongodb_uri}`);

  const server = await init_server(port);
  logger.info(`running on http://${host}:${port}`);

  // first log error, then close database
  const error_handler = handle_error(log_uncaught_error, cleanup_db);

  server.on("close", error_handler);
  process.on("uncaughtException", error_handler);
  process.on("unhandledRejection", error_handler);
}

bootstrap().catch((error) => {
  logger.error("error while bootstrapping the server", error);
  process.exit(1);
});
