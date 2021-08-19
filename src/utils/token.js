import jwt, { JwtPayload } from "jsonwebtoken";
import config from "@/config";
import errors from "errors";

export default {
  /**
   * @param {Object} payload
   * @returns {string}
   */
  sign: (payload) => {
    return jwt.sign(payload, config.jsonwebtoken_secret, { expiresIn: "7d" });
  },
  /**
   *
   * @param {string} token
   * @returns {Promise<JwtPayload>}
   */
  verify: (token) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, config.jsonwebtoken_secret, (err, decoded) => {
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
