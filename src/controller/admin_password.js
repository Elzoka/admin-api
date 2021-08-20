import express from "express";
import authentication from "@/authentication";
import { update_object } from "@/persistence";

const router = express.Router();

router.patch("/", async (req, res, next) => {
  const payload = await authentication.verify_reset_password_token(
    req.body.reset_password_token
  );

  await update_object("admin", {
    id: payload.id,
    mode: "update_password",
    password: req.body.password,
  });

  res.status(200).end();
});

export default router;
