import prisma from "../db.js";
import AppError from "../utils/AppError.js";
import { sendSuccess, sendCreated } from "../utils/response.js";

export const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      throw new AppError("Items tidak boleh kosong", 400);
    }

    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product)
        throw new AppError(`Product ${item.productId} tidak ditemukan`, 404);
      if (product.stock < item.quantity) {
        throw new AppError(`Stik ${product.name} tidak cukup`, 400);
      }
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          status: "pending",
          orderItems: {
            create: orderItems,
          },
        },
        include: {
          orderItems: {
            include: { product: true },
          },
        },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    const io = req.app.get("io");
    io.to(`user:${req.user.id}`).emit("order:created", {
      message: "Order kamu berhasil dibuat!",
      orderId: order.id,
      status: order.status,
    });

    sendCreated(res, order, "Order berhasil dibuat");
  } catch (error) {
    next(error);
  }
};

export const getuserOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    sendSuccess(res, orders);
  } catch (error) {
    next(error);
  }
};
