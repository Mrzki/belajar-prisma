import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Terlalu banyak request, coba lagi dalam 15 menit",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Terlalu banyak percobaan login, coba lagi dalam 15 menit",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
