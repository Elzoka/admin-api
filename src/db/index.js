import mongoose from "mongoose";
import config from "@/config";
import logger from "@/logger";

/**
 * @callback CleanupFunc
 * @param {boolean} [force]
 * @returns {Promise<void>}
 *
 * @param {string} uri
 * @returns {Promise<CleanupFunc>}
 */
export async function init_database(uri) {
  if (config.mongodb_debug) {
    mongoose.set("debug", true);
  }

  if (!uri) {
    logger.error("invalid database uri");
    throw new Error("invalid database uri");
  }

  const { connection } = await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  return connection.close;
}
