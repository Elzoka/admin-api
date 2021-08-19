import dotenv from "dotenv";

/**
 *
 * Configuration object
 * @typedef {Object} IConfig
 * @property {string} host Network interface to listen on
 * @property {number} port The port the project runs on locally
 * @property {string} log_level Logger log level
 * @property {string} service The running service
 * @property {boolean} mongodb_debug debug level
 * @property {string} mongodb_uri Database uri
 * @property {string} test_mongodb_uri Testing Database uri
 * @property {number} default_page_size Pagination default page size
 */

dotenv.config();

/** @type {IConfig} */
const config = {};

// convert variables to lower case
Object.keys(process.env).forEach((key) => {
  config[key.toLowerCase()] = process.env[key];
});

export default config;
