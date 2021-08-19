import mongoose, {
  Schema,
  Model,
  Document,
  DocumentDefinition,
} from "mongoose";

/**
 * @typedef {Object} UserModel
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} email
 * @property {string} username
 * @property {string} slug
 * @property {string} [password]
 * @property {string} status
 * @property {string} avatar
 *
 * @typedef {UserModel & Document} User
 */

/** @type {Schema<User>} */
const admin_schema = new Schema(
  {
    first_name: String,
    last_name: String,
    email: {
      type: String,
      index: true,
      unique: true,
    },
    username: {
      type: String,
      index: true,
      unique: true,
    },
    slug: {
      // generated from username, so it would be unique as well,
      type: String,
      index: true,
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
      select: false,
    },
    status: String,
  },
  { timestamps: true }
);

/** @type {Model<User>} */
const Admin = mongoose.model("Admin", admin_schema);

export default Admin;
