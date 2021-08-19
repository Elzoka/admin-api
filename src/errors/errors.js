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
