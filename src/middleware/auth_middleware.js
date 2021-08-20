import { RequestHandler } from "express";
import token from "@/utils/token";
import errors from "errors";
import { get_object } from "persistence";

/**
 * @type {RequestHandler}
 */
export default async function auth_middleware(req, res, next) {
  const token_string = req.headers.authorization?.split("Bearer ")?.[1];

  // verify token
  const payload = await token.verify(token_string);

  // check user exists (it will throw by default)
  const user = await get_object("admin", payload.id, { email: true });

  // append user to req
  req.user = user;

  next();
}
