import errors from "@/errors";
import { listing } from "@/persistence";
import { Admin } from "@/models/admin";
import password from "@/utils/password";
import token from "utils/token";

export default {
  /**
   *
   * @param {string} email
   * @param {string} password
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
};
