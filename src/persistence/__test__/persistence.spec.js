jest.mock("@/config", () => {
  const config = jest.requireActual("@/config").default;
  return {
    ...config,
    mongodb_debug: false,
  };
});

import mongoose from "mongoose";
import faker from "faker";
import config from "@/config";
import {
  create_object,
  delete_object,
  get_object,
  truncate_collection,
  truncate_database,
  update_object,
} from "@/persistence";
import { init_database } from "@/db";
import * as errors from "@/errors/errors";
import { Admin } from "@/models/admin";

function generate_admin_object(defaults = {}) {
  return {
    first_name: faker.name.findName(),
    last_name: faker.name.lastName(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: faker.internet.password(),
    ...defaults,
  };
}

/** @type {import('mongoose').Connection*/
let connection;
beforeAll(async () => {
  connection = await init_database(config.test_mongodb_uri);
});

afterAll(async () => {
  await truncate_database();
  connection.close();
});

beforeEach(async () => {
  await truncate_collection("admin");
});

describe("persistence", () => {
  describe("create_object", () => {
    test("create object successfully", async () => {
      const fake_admin = generate_admin_object();
      const new_admin = await create_object("admin", fake_admin);

      expect(new_admin).toEqual(expect.objectContaining(fake_admin));
    });

    test("duplicate error", async () => {
      const fake_admin = generate_admin_object();

      await create_object("admin", fake_admin);

      // duplicate
      await expect(create_object("admin", fake_admin)).rejects.toEqual(
        errors.duplicate_key()
      );
    });
  });
  describe("get_object", () => {
    test("not found", async () => {
      const random_id = mongoose.Types.ObjectId();

      await expect(get_object("admin", random_id)).rejects.toEqual(
        errors.not_found()
      );
    });
    test("success", async () => {
      const fake_admin = generate_admin_object();
      /** @type {Admin} */
      const new_admin = await create_object("admin", fake_admin, {});
      const { password, ...object } = new_admin.toJSON();
      const fetched_admin = await get_object("admin", new_admin.id);

      expect(fetched_admin).toEqual(object);
    });
  });
  describe("update_object", () => {
    test("not found", async () => {
      const random_id = mongoose.Types.ObjectId();
      const update_body = generate_admin_object();

      await expect(
        update_object("admin", { id: random_id, ...update_body })
      ).rejects.toEqual(errors.not_found());
    });
    test("success", async () => {
      const fake_admin = generate_admin_object();
      /** @type {Admin} */
      const new_admin = await create_object("admin", fake_admin, {});

      // generate new updates
      const { password, ...updates } = generate_admin_object();
      const updated_admin = await update_object("admin", {
        id: new_admin.id,
        ...updates,
      });

      expect(updated_admin).toEqual(expect.objectContaining(updates));
    });
  });
  describe("delete_object", () => {
    test("not found", async () => {
      const random_id = mongoose.Types.ObjectId();

      await expect(delete_object("admin", random_id)).rejects.toEqual(
        errors.not_found()
      );
    });
    test("success", async () => {
      const fake_admin = generate_admin_object();
      /** @type {Admin} */
      const new_admin = await create_object("admin", fake_admin, {});

      // delete admin
      const deleted_admin = await delete_object("admin", new_admin.id);
      expect(deleted_admin).toEqual(new_admin.toJSON());

      // check that it's deleted
      await expect(get_object("admin", new_admin.id)).rejects.toEqual(
        errors.not_found()
      );
    });
  });
});
