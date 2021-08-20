/**
 * @typedef {Object} IAPIError
 * @property {true} api_error
 * @property {number} status_code
 * @property {string} [message]
 * @property {string} code
 * @property {any} [data]
 *
 * @callback ErrorFactory
 * @param {any} data
 * @returns {IAPIError}
 *
 * Create an error object
 * @param {number} status_code
 * @param {string} code
 * @returns {ErrorFactory}
 */
function create_error(status_code, code) {
  return (data) => ({
    api_error: true,
    status_code,
    message: code,
    code,
    data,
  });
}

export const unknown_error = create_error(500, "unknown_error");
export const not_found = create_error(404, "not_found");
export const duplicate_key = create_error(409, "duplicate_key");
export const invalid_model = create_error(400, "invalid_model");
export const validation_error = create_error(400, "validation_error");
export const user_does_not_exist = create_error(400, "user_does_not_exist");
export const invalid_credentials = create_error(400, "invalid_credentials");
export const expired_token = create_error(401, "expired_token");
export const unauthorized = create_error(401, "unauthorized");
export const unable_to_upload_image = create_error(
  500,
  "unable_to_upload_image"
);
