import dotenv from "dotenv";

/**
 *
 * Configuration object
 * @typedef {Object} IConfig
 * @property {string} host Network interface to listen on
 * @property {number} port The port the project runs on locally
 */

dotenv.config();

/** @type {IConfig} */
const config = {};

// convert variables to lower case
Object.keys(process.env).forEach((key) => {
  config[key.toLowerCase()] = process.env[key];
});

export default config;
