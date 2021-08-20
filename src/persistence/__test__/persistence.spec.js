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
  listing,
  truncate_collection,
  truncate_database,
  update_object,
} from "@/persistence";
import { init_database } from "@/db";
import * as errors from "@/errors/errors";
import { Admin } from "@/models/admin";
import _ from "lodash";

function generate_admin_object(defaults = {}) {
  return {
    first_name: faker.name.findName(),
    last_name: faker.name.lastName(),
    email: faker.internet.email(),
    username: faker.random.alphaNumeric(15),
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

function seed_admins(count = 50) {
  const admins = _.range(count).map(() =>
    create_object("admin", generate_admin_object())
  );
  // ignore bulk creations for now
  return Promise.all(admins);
}

describe("persistence", () => {
  describe("create_object", () => {
    test("create object successfully", async () => {
      const fake_admin = generate_admin_object();
      const new_admin = await create_object("admin", fake_admin);

      const { password, ...data } = fake_admin;
      expect(new_admin).toEqual(expect.objectContaining(data));
    });

    test("invalid model", async () => {
      const model_name = faker.database.collation();
      await expect(create_object(model_name, {})).rejects.toEqual(
        errors.invalid_model({ model_name })
      );
    });

    test("validation", async () => {
      const fake_admin = generate_admin_object();

      const { data, ...err } = errors.validation_error();
      await expect(
        create_object("admin", { ...fake_admin, password: "5" })
      ).rejects.toEqual(expect.objectContaining(err));
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

    test("validation", async () => {
      const fake_admin = generate_admin_object();

      const { data, ...err } = errors.validation_error();
      await expect(
        update_object("admin", {
          ...fake_admin,
          mode: "update_password",
          password: "5",
        })
      ).rejects.toEqual(expect.objectContaining(err));
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
      const { password, ...data } = deleted_admin;
      expect(data).toEqual(new_admin.toJSON());

      // check that it's deleted
      await expect(get_object("admin", new_admin.id)).rejects.toEqual(
        errors.not_found()
      );
    });
  });
  describe("listing", () => {
    test("search", async () => {
      const size = 50;
      const admins = await seed_admins(size);

      const { pagination, results } = await listing("admin", {
        search: admins[_.random(0, size)].email,
        page_size: 1,
      });

      expect(pagination.count).toBeGreaterThanOrEqual(1);
      expect(results.length).toBe(1);

      const { pagination: new_pagination, results: new_results } =
        await listing("admin", {
          search: admins[_.random(0, size)].username,
          page_size: 1,
        });

      expect(new_pagination.count).toBeGreaterThanOrEqual(1);
      expect(new_results.length).toBe(1);
    });
    test("filters", async () => {
      const size = 50;
      const admins = await seed_admins(size);

      const { pagination, results } = await listing("admin", {
        filters: { email: admins[_.random(0, size)].email },
        page_size: 1,
      });

      expect(pagination.count).toBe(1);
      expect(results.length).toBe(1);

      const { pagination: new_pagination, results: new_results } =
        await listing("admin", {
          filters: { username: admins[_.random(0, size)].username },
          page_size: 1,
        });

      expect(new_pagination.count).toBe(1);
      expect(new_results.length).toBe(1);
    });
  });
});
