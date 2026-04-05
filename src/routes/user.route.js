import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);

router.post("/", authenticate, authorize("admin"), createUser);
router.put("/:id", authenticate, authorize("admin"), updateUser);
router.delete("/:id", authenticate, authorize("admin"), deleteUser);

export default router;
