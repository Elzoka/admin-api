/* eslint-disable import/namespace */
import mongoose, { QueryOptions, SaveOptions, Document } from "mongoose";
import _ from "lodash";
import logger from "@/logger";
import errors from "@/errors";
import * as models from "@/models";
import { validate } from "@/validation";
import config from "@/config";

/**
 * @typedef {Object} IBody
 * @property {string} id
 * @property {"create"|"update"|"update_password"} mode
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
  { id, mode = "update", ...body },
  options = { new: true, lean: true }
) {
  logger.info("persistence.update_object");

  const Model = models[model_name];

  if (!Model) {
    throw errors.invalid_model({ model_name });
  }

  try {
    const { error } = validate(model_name, mode, body);

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
 * @param {QueryOptions} [options]
 * @return {Promise<Document|Object>}
 */
export async function delete_object(model_name, id, options = { lean: true }) {
  logger.info("persistence.delete_object");

  const Model = models[model_name];

  if (!Model) {
    throw errors.invalid_model({ model_name });
  }

  logger.info(`start deleting ${Model.name} with id ${id}`);

  const deleted_object = await Model.findByIdAndDelete(id, options);

  if (!deleted_object) {
    throw errors.not_found();
  }

  logger.info(`${Model.name} with id ${id} has been deleted successfully`);

  return deleted_object;
}

/**
 *
 * @typedef {Object} SearchBody
 * @property {string} search
 * @property {Object} filters
 * @property {number} page_number
 * @property {number} page_size
 *
 * @typedef {Object} IPagination
 * @property {number} count
 * @property {} page_number
 * @property {} page_size
 *
 * @typedef {Object} SearchResults
 * @property {IPagination} pagination
 * @property {Document[]|Object[]} results
 *
 *
 * @param {ModelName} model_name
 * @param {SearchBody} param1
 * @param {QueryOptions} options
 * @returns {Promise<SearchResults>}
 */
export async function listing(
  model_name,
  { search, filters, page_number = 1, page_size = config.default_page_size },
  options = { lean: true }
) {
  logger.info("persistence.listing");

  /** @type {mongoose.Model} */
  const Model = models[model_name];

  if (!Model) {
    throw errors.invalid_model({ model_name });
  }

  logger.info(`start listing ${Model.name} with filters`, { search, filters });

  const search_query = Model.searchable_attributes.map((attr) => ({
    [attr]: {
      $regex: new RegExp("^(.*)?" + _.escapeRegExp(search) + "(.*)?", "i"),
    },
  }));

  const query = {
    $or: search_query,
    ...filters,
  };

  page_size = Number(page_size) || 10;
  options = _.assign(options, {
    skip: (page_number - 1) * page_size,
    limit: page_size,
  });

  const [count, results] = await Promise.all([
    Model.countDocuments(query),
    Model.find(query, null, options),
  ]);

  return {
    pagination: { count, page_number, page_size },
    results,
  };
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
