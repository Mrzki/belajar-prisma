import "./utils/redis.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import productRouter from "./routes/product.route.js";
import authRouter from "./routes/auth.route.js";
import { generateLimiter } from "./middlewares/rateLimiter.middleware.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";

const app = express();
const PORT = 3000;

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(generateLimiter);
app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);

app.get("/", (req, res) => {
  res.json({ message: "server is running!" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
