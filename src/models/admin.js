import mongoose, { Schema, Model, Document } from "mongoose";

/**
 * @typedef {Object} AdminModel
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} email
 * @property {string} username
 * @property {string} slug
 * @property {string} [password]
 * @property {string} status
 * @property {string} avatar
 *
 * @typedef {AdminModel & Document} Admin
 */

/** @type {Schema<Admin>} */
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

/** @type {Model<Admin>} */
const admin = mongoose.model("Admin", admin_schema);

export default admin;
