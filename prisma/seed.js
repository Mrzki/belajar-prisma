// prisma/seed.js
import prisma from "../src/db.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("password123", 10);
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Buat users
  const budi = await prisma.user.create({
    data: {
      name: "Budi Santoso",
      email: "budi@gmail.com",
      password: hashedPassword,
      role: "user",
    },
  });
  const ani = await prisma.user.create({
    data: {
      name: "Ani Wijaya",
      email: "ani@gmail.com",
      password: hashedPassword,
      role: "user",
    },
  });
  await prisma.user.create({
    data: {
      name: "Citra Dewi",
      email: "citra@gmail.com",
      password: hashedPassword,
      role: "user",
    },
  });

  // Tambahkan admin
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedAdminPassword,
      role: "admin",
    },
  });

  // Buat products
  const sepatu = await prisma.product.create({
    data: { name: "Sepatu Nike", price: 500000, stock: 10 },
  });
  const kaos = await prisma.product.create({
    data: { name: "Kaos Polos", price: 75000, stock: 50 },
  });
  const celana = await prisma.product.create({
    data: { name: "Celana Jeans", price: 250000, stock: 20 },
  });
  const topi = await prisma.product.create({
    data: { name: "Topi Baseball", price: 120000, stock: 30 },
  });

  // Buat orders
  const order1 = await prisma.order.create({
    data: { userId: budi.id, status: "paid" },
  });
  const order2 = await prisma.order.create({
    data: { userId: budi.id, status: "pending" },
  });
  const order3 = await prisma.order.create({
    data: { userId: ani.id, status: "paid" },
  });

  // Buat order items
  await prisma.orderItem.createMany({
    data: [
      { orderId: order1.id, productId: sepatu.id, quantity: 1, price: 500000 },
      { orderId: order1.id, productId: kaos.id, quantity: 2, price: 75000 },
      { orderId: order2.id, productId: celana.id, quantity: 1, price: 250000 },
      { orderId: order3.id, productId: kaos.id, quantity: 3, price: 75000 },
      { orderId: order3.id, productId: topi.id, quantity: 1, price: 120000 },
    ],
  });

  console.log("Seeding selesai!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
