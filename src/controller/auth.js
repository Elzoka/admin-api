import express from "express";
import authentication from "@/authentication";

const router = express.Router();

router.post("/login", async (req, res, next) => {
  const token = await authentication.login(req.body.email, req.body.password);

  res.json({ token });
});

router.post("/forget-password", async (req, res, next) => {
  const reset_password_token =
    await authentication.generate_reset_password_token(req.body.email);

  res.json({ reset_password_token });
});

export default router;
