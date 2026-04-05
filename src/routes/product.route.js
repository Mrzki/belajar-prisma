import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../validations/product.validation.js";
import { cache } from "../middlewares/cache.moddleware.js";

const router = Router();

router.get("/", cache(60), getAllProducts);
router.get("/:id", cache(60), getProductById);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createProductSchema),
  createProduct,
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateProductSchema),
  updateProduct,
);
router.delete("/:id", authenticate, authorize("admin"), deleteProduct);

export default router;
