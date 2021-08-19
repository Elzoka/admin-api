import Joi from "joi";

// const password_pattern = new RegExp("^[a-zA-Z0-9]{3,30}$");

export const create = Joi.object({
  first_name: Joi.string().min(3).max(50).required(),
  last_name: Joi.string().min(3).max(50).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string()
    // .pattern(password_pattern).
    .min(3)
    .max(100)
    .required(),
  avatar: Joi.link(),
  status: Joi.string().valid("active", "inactive").default("active"),
});

export const update = Joi.object({
  first_name: Joi.string().min(3).max(50),
  last_name: Joi.string().min(3).max(50),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  username: Joi.string().alphanum().min(3).max(30),
  password: Joi.string()
    // .pattern(password_pattern)
    .min(3)
    .max(100),
  avatar: Joi.link(),
  status: Joi.string().valid("active", "inactive").default("active"),
});
