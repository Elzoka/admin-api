import jwt, { JwtPayload } from "jsonwebtoken";
import config from "@/config";
import errors from "errors";

/**
 * @typedef {JwtPayload} JWTPayload
 */

export default {
  /**
   *
   * @typedef {Object} ISignTokenOptions
   * @property {string} [secret]
   * @property {string} [expiresIn]
   *
   * @param {Object} payload
   * @param {ISignTokenOptions} options
   * @returns {string}
   */
  sign: (
    payload,
    { secret = config.jsonwebtoken_secret, expiresIn = "7d" } = {}
  ) => {
    return jwt.sign(payload, secret, { expiresIn });
  },
  /**
   *
   * @typedef {Object} IVerifyTokenOptions
   * @property {string} [secret]
   *
   * @param {string} token
   * @param {IVerifyTokenOptions} options
   * @returns {Promise<JwtPayload>}
   */
  verify: (token, { secret = config.jsonwebtoken_secret } = {}) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          // check if expired
          if (err.name === "TokenExpiredError") {
            throw errors.expired_token();
          }

          throw errors.unauthorized();
        }

        resolve(decoded);
      });
    });
  },
};
