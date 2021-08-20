jest.mock("@/config", () => {
  const config = jest.requireActual("@/config").default;
  return {
    ...config,
    mongodb_debug: false,
  };
});

import faker from "faker";
import {
  create_object,
  truncate_collection,
  truncate_database,
} from "@/persistence";
import config from "@/config";
import authentication from "@/authentication";
import { init_database } from "@/db";
import errors from "@/errors";

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

describe("authentication", () => {
  describe("login", () => {
    test("login", async () => {
      const fake_admin = generate_admin_object();

      await create_object("admin", fake_admin);

      const token = await authentication.login(
        fake_admin.email,
        fake_admin.password
      );

      expect(token).toBeTruthy();
    });

    test("login fails (user does not exist)", async () => {
      const fake_admin = generate_admin_object();

      await expect(
        authentication.login(fake_admin.email, fake_admin.password)
      ).rejects.toEqual(errors.user_does_not_exist());
    });

    test("login fails (invalid password)", async () => {
      const fake_admin = generate_admin_object();

      await create_object("admin", fake_admin);

      await expect(
        authentication.login(fake_admin.email, fake_admin.password + "1")
      ).rejects.toEqual(errors.invalid_credentials());
    });
  });
  describe("reset password", () => {
    test("generate reset password token", async () => {
      const fake_admin = generate_admin_object();

      const admin = await create_object("admin", fake_admin);

      const reset_password_token =
        await authentication.generate_reset_password_token(admin.email);
      expect(reset_password_token).toBeTruthy();
    });

    test("verify reset password token (success)", async () => {
      const fake_admin = generate_admin_object();

      const admin = await create_object("admin", fake_admin);

      const reset_password_token =
        await authentication.generate_reset_password_token(admin.email);

      const payload = await authentication.verify_reset_password_token(
        reset_password_token
      );

      expect(payload.id).toEqual(admin.id);
    });

    test("verify reset password token (fail)", async () => {
      const fake_admin = generate_admin_object();

      const admin = await create_object("admin", fake_admin);

      const reset_password_token = authentication.generate_reset_password_token(
        admin.email
      );
      await expect(
        authentication.verify_reset_password_token(reset_password_token + "a")
      ).rejects.toEqual(errors.unauthorized());
    });
  });
});
