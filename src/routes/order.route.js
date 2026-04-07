import { Router } from "express";
import { createOrder, getuserOrders } from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/", authenticate, getuserOrders);

export default router;
