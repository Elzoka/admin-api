import express from "express";
import authentication from "@/authentication";

const router = express.Router();

router.post("/login", async (req, res, next) => {
  const token = await authentication.login(req.body.email, req.body.password);

  res.json({ token });
});

export default router;
