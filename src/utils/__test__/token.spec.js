import token from "utils/token";
import mongoose from "mongoose";

describe("token", () => {
  test("sign", () => {
    const signed_token = token.sign({
      id: mongoose.Types.ObjectId().toHexString(),
    });

    expect(typeof signed_token).toBe("string");
  });
  test("verify", async () => {
    const id = mongoose.Types.ObjectId().toHexString();
    const signed_token = token.sign({ id });

    const payload = await token.verify(signed_token);

    expect(payload).toEqual(expect.objectContaining({ id }));
  });
});
