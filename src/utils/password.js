import bcrypt from "bcryptjs";

export default {
  /**
   *
   * @param {string} password
   * @returns {Promise<string>}
   */
  hash: async (password) => {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    return hash;
  },
  /**
   * @param {string} password
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  compare: bcrypt.compare,
};
