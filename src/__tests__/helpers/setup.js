import { execSync } from "child_process";
import prisma from "../../db.js";
import redis from "../../utils/redis.js";
import bcrypt from "bcrypt";

export const setupTestDB = async () => {
  process.env.DATABASE_URL = process.env.DATABASE_URL;

  execSync("npx prisma migrate deploy", { stdio: "inherit" });
};

export const clearDB = async () => {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
};

export const teardownDB = async () => {
  await prisma.$disconnect();
  await redis.quit();
};

export const seedAdmin = async () => {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  return prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
    },
  });
};

export const seedUser = async () => {
  const hashedPassword = await bcrypt.hash("password123", 10);
  return prisma.user.create({
    data: {
      name: "Budi Santoso",
      email: "budi@gmail.com",
      password: hashedPassword,
      role: "user",
    },
  });
};

export const seedProduct = async () => {
  return prisma.product.create({
    data: {
      name: "Tas Alto",
      price: 200000,
      stock: 10,
    },
  });
};
