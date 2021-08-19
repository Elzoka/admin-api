import mongoose from "mongoose";
import config from "@/config";
import logger from "@/logger";

/**
 * @param {string} uri
 * @returns {Promise<mongoose.Connection>}
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
    useCreateIndex: true,
  });

  return connection;
}
