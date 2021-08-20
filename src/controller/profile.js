import express from "express";
import { get_object, update_object } from "@/persistence";
import authentication from "@/authentication";
import upload from "@/upload";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const profile = await get_object("admin", req.user._id);

  res.json(profile);
});

router.patch("/", async (req, res, next) => {
  const updated_profile = await update_object("admin", {
    id: req.user._id,
    ...req.body,
  });

  res.json(updated_profile);
});

router.patch("/password", async (req, res, next) => {
  // attempt to login with old password
  await authentication.login(req.user.email, req.body.old_password);

  // if succeed, proceed to update password
  await update_object("admin", {
    id: req.user._id,
    mode: "update_password",
    password: req.body.password,
  });

  res.status(200).end();
});

router.patch("/avatar", async (req, res, next) => {
  const avatar_url = await upload(req);

  const updated_object = await update_object("admin", {
    id: req.user._id,
    avatar: avatar_url,
    mode: "update_avatar",
  });

  res.status(200).json(updated_object);
});

export default router;
