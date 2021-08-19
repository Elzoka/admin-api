import mongoose, { Schema, Model, Document } from "mongoose";
import password from "utils/password";

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

admin_schema.pre("save", async function hash_password(next) {
  if (!this.isModified("password")) {
    return next();
  }

  // if password is modified hash it
  try {
    const hashed_password = await password.hash(this.password);

    this.password = hashed_password;
    next();
  } catch (e) {
    next(e);
  }
});

admin_schema.pre("findOneAndUpdate", async function has_password(...data) {
  if (this._update.password) {
    this._update.password = await password.hash(this._update.password);
  }
});

admin_schema.post("save", function remove_password() {
  // unselect password specially on create
  this.password = undefined;
});

/** @type {Model<Admin>} */
const admin = mongoose.model("Admin", admin_schema);

admin.searchable_attributes = ["email", "username", "slug"];

export default admin;
