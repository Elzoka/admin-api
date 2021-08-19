import winston from "winston";
import config from "@/config";

const { combine, timestamp, printf, ms, colorize } = winston.format;

const custom_format = printf(
  ({ level, message, label, timestamp, ms, service }) => {
    return `${timestamp} [${service}] ${level}: ${message} (${ms})`;
  }
);

const logger = winston.createLogger({
  level: config.log_level,
  silent: process.env.NODE_ENV === "test",
  format: combine(colorize(), timestamp(), ms(), custom_format),
  defaultMeta: { service: config.service },
  transports: [new winston.transports.Console()],
});

export default logger;
