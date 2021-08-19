import express from "express";
import {
  create_object,
  get_object,
  update_object,
  delete_object,
  listing,
} from "@/persistence";
import logger from "@/logger";

const router = express.Router({ mergeParams: true });

router.get("/:id", async (req, res, next) => {
  const object = await get_object(req.params.model_name, req.params.id);

  logger.info("got object", { object });
  res.json(object);
});

router.post("/", async (req, res, next) => {
  const object = await create_object(req.params.model_name, req.body);
  logger.info("created object", { object });
  res.json(object);
});

router.patch("/:id", async (req, res, next) => {
  const object = await update_object(req.params.model_name, {
    id: req.params.id,
    ...req.body,
  });

  logger.info("updated object", { object });

  res.json(object);
});

router.delete("/:id", async (req, res, next) => {
  const object = await delete_object(req.params.model_name, req.params.id);

  logger.info("deleted object", { object });

  res.json({ ...object, deleted_at: new Date() });
});

export default router;
