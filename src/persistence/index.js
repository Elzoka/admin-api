/* eslint-disable import/namespace */
import { QueryOptions, SaveOptions } from "mongoose";
import logger from "@/logger";
import errors from "@/errors";
import * as models from "@/models";
import { validate } from "@/validation";

/**
 * @typedef {Object} IBody
 * @property {string} id
 *
 * @typedef {'admin'} ModelName
 */

/**
 * @param {ModelName} model_name
 * @param {Object} data
 * @param {SaveOptions} [options]
 * @return {Promise<Document|Object>}
 */
export async function create_object(model_name, data, options = {}) {
  logger.info("persistence.create_object");

  const Model = models[model_name];

  if (!Model) {
    throw errors.invalid_model({ model_name });
  }

  const { error } = validate(model_name, "create", data);

  if (error) {
    throw errors.validation_error({ message: error.message });
  }

  logger.info(`start creating ${Model.name}`);

  try {
    // create object
    const [created_object] = await Model.create([data], options);

    logger.info(
      `${Model.name} with id ${created_object.id} has been fetched successfully`
    );

    return created_object;
  } catch (err) {
    // manage duplicate error
    if (err && err.code === 11000) {
      throw errors.duplicate_key();
    }

    // if not duplicate error throw the original one
    throw err;
  }
}

/**
 * @param {ModelName} model_name
 * @param {string} id
 * @param {Object|string} projection
 * @param {QueryOptions} [options]
 * @return {Promise<Document|Object>}
 */
export async function get_object(
  model_name,
  id,
  projection,
  options = { lean: true }
) {
  logger.info("persistence.get_object");

  const Model = models[model_name];

  if (!Model) {
    throw errors.invalid_model({ model_name });
  }

  // TODO: maybe cache

  logger.info(`start getting ${Model.name} with id ${id}`);

  const fetched_object = await Model.findById(id, projection, options);

  if (!fetched_object) {
    throw errors.not_found();
  }

  logger.info(`${Model.name} with id ${id} has been fetched successfully`);

  return fetched_object;
}

/**
 * @param {ModelName} model_name
 * @param {IBody} body
 * @param {QueryOptions} [options]
 * @return {Promise<Document|Object>}
 */
export async function update_object(
  model_name,
  { id, ...body },
  options = { new: true, lean: true }
) {
  logger.info("persistence.update_object");

  const Model = models[model_name];

  if (!Model) {
    throw errors.invalid_model({ model_name });
  }

  const { error } = validate(model_name, "update", body);

  if (error) {
    throw errors.validation_error(error);
  }

  logger.info(`start updating ${Model.name} with id ${id}`);

  const updated_object = await Model.findByIdAndUpdate(id, body, options);

  if (!updated_object) {
    throw errors.not_found();
  }

  logger.info(`${Model.name} with id ${id} has been updated successfully`);

  return updated_object;
}

/**
 * @param {ModelName} model_name
 * @param {string} id
 * @param {QueryOptions} [options]
 * @return {Promise<Document|Object>}
 */
export async function delete_object(model_name, id, options = { lean: true }) {
  logger.info("persistence.delete_object");

  const Model = models[model_name];

  if (!Model) {
    throw errors.invalid_model({ model_name });
  }

  // TODO: validate update body

  logger.info(`start deleting ${Model.name} with id ${id}`);

  const deleted_object = await Model.findByIdAndDelete(id, options);

  if (!deleted_object) {
    throw errors.not_found();
  }

  logger.info(`${Model.name} with id ${id} has been deleted successfully`);

  return deleted_object;
}

/**
 * @param {ModelName} model_name
 * @param {QueryOptions} [options]
 * @return {Promise<void>}}
 */
export async function truncate_collection(model_name, options = {}) {
  logger.info("persistence.truncate_collection");

  const Model = models[model_name];

  if (!Model) {
    throw errors.invalid_model({ model_name });
  }

  logger.info(`start truncating collection ${Model.name}`);

  await Model.deleteMany({}, options);

  logger.info(`collection ${Model.name} truncated successfully`);
}

/**
 * @param {QueryOptions} [options]
 * @return {Promise<void>}}
 */
export async function truncate_database(options = {}) {
  logger.info("persistence.truncate_database");

  logger.info("start truncating database");
  for (const model_name in models) {
    await truncate_collection(model_name, options);
  }

  logger.info("database truncated successfully");
}
