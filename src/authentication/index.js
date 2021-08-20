import errors from "@/errors";
import { listing } from "@/persistence";
import { Admin } from "@/models/admin";
import password from "@/utils/password";
import token, { JWTPayload } from "@/utils/token";
import config from "@/config";

export default {
  /**
   *
   * @param {string} email
   * @param {string} password
   * @returns {string}
   */
  login: async (email, pass = "") => {
    // check if user exists
    const {
      pagination: { count },
      results,
    } = await listing(
      "admin",
      {
        filters: {
          email,
        },
      },
      { projection: "password" }
    );

    if (count < 1) {
      throw errors.user_does_not_exist();
    }

    /** @type {Admin} */
    const [admin] = results;

    // compare password
    const is_correct_password = await password.compare(pass, admin.password);
    if (!is_correct_password) {
      throw errors.invalid_credentials();
    }

    // generate token
    return token.sign({ id: admin.id });
  },
  /**
   *
   * @param {string} email
   * @returns {string}
   */
  generate_reset_password_token: async (email) => {
    // check if user exists
    const {
      pagination: { count },
      results,
    } = await listing(
      "admin",
      {
        filters: {
          email,
        },
      },
      { projection: "id" }
    );

    if (count < 1) {
      throw errors.user_does_not_exist();
    }

    /** @type {Admin} */
    const [admin] = results;

    // generate token
    return token.sign(
      { id: admin.id },
      { secret: config.jsonwebtoken_reset_password_secret, expiresIn: "10m" }
    );
  },
  /**
   *
   * @param {string} reset_password_token
   * @returns {Promise<JWTPayload>}
   */
  verify_reset_password_token: (reset_password_token) => {
    return token.verify(reset_password_token, {
      secret: config.jsonwebtoken_reset_password_secret,
    });
  },
};
