import { ValidationResult } from "joi";
import { validators } from "@/validation";
import { ModelName } from "@/persistence";

/**
 *
 * @param {ModelName} model_name
 * @param {string} mode
 * @param {Object} body
 * @param {Object} [options]
 * @returns {ValidationResult}
 */
export default function validate(model_name, mode, body, options = {}) {
  return validators[model_name][mode].validate(body, options);
}
