import { Request, Response, NextFunction } from "express";
import logger from "@/logger";
import errors from "@/errors";

/**
 * @param {Error} err
 * @returns {void}
 */

function log_uncaught_error(err) {
  logger.error("An unknown error occurred", {
    stack: err.stack,
    message: err.message,
  });
}

/**
 * @type {errors.IAPIError|Error} err
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export default function error_handler(err, _req, res, next) {
  if (err.api_error) {
    return res.status(err.status_code).json(err);
  }

  log_uncaught_error(err);

  const unknown_error = errors.unknown_error();
  res.status(unknown_error.status_code).json(unknown_error);

  next();
}

process.on("uncaughtException", log_uncaught_error);
process.on("unhandledRejection", log_uncaught_error);
