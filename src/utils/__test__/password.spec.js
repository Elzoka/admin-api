import password from "@/utils/password";

describe("password", () => {
  test("hash", async () => {
    const pass = "123456";
    const hashed_password = await password.hash(pass);

    expect(hashed_password).not.toBe(pass);
  });

  test("compare success", async () => {
    const pass = "123456";
    const hashed_password = await password.hash(pass);

    const is_correct = await password.compare(pass, hashed_password);

    expect(is_correct).toBe(true);
  });

  test("compare fails", async () => {
    const pass = "123456";
    const hashed_password = await password.hash(pass);

    const another_pass = "1234567";

    const is_correct = await password.compare(another_pass, hashed_password);

    expect(is_correct).toBe(false);
  });
});
