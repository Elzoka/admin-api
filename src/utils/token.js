import jwt, { JwtPayload } from "jsonwebtoken";
import config from "@/config";

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
        if (err) return reject(err);

        resolve(decoded);
      });
    });
  },
};
