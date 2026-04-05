import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", authenticate, getMe);

export default router;
