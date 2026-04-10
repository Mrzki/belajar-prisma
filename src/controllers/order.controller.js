import prisma from "../db.js";
import AppError from "../utils/AppError.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import snap from "../utils/midtrans.js";

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

    const totalAmount = orderItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

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
          user: true,
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

    const midtransParameter = {
      transaction_details: {
        order_id: `ORDER-${order.id}-${Date.now()}`,
        gross_amount: totalAmount,
      },
      item_details: order.orderItems.map((item) => ({
        id: item.productId.toString(),
        price: item.price,
        quantity: item.quantity,
        name: item.product.name,
      })),
      customer_details: {
        first_name: order.user.name,
        email: order.user.email,
      },
    };

    const midtransResponse = await snap.createTransaction(midtransParameter);

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        snapToken: midtransResponse.token,
        snapUrl: midtransResponse.redirect_url,
      },
    });

    const io = req.app.get("io");
    io.to(`user:${req.user.id}`).emit("order:created", {
      message: "Order berhasil dibuat! Silakan lakukan pembayaran.",
      orderId: order.id,
      paymentUrl: midtransResponse.redirect_url,
    });

    sendCreated(
      res,
      {
        order: updatedOrder,
        payment: {
          token: midtransResponse.token,
          payment_url: midtransResponse.redirect_url,
        },
      },
      "Order berhasil dibuat",
    );
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

export const handleWebhook = async (req, res, next) => {
  try {
    const notification = req.body;
    console.log("Webhook diterima:", notification);

    const orderId = parseInt(notification.order_id.split("-")[1]);
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    console.log(`Order ID: ${orderId}, Status: ${transactionStatus}`);

    let orderStatus;

    if (transactionStatus === "capture") {
      orderStatus = fraudStatus === "accept" ? "paid" : "fraud";
    } else if (transactionStatus === "settlement") {
      orderStatus = "paid";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      orderStatus = "cancelled";

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (order) {
        for (const item of order.orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    } else if (transactionStatus === "pending") {
      orderStatus = "pending";
    }

    if (orderStatus) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: orderStatus },
      });

      console.log(`Order ${orderId} diupdate ke status: ${orderStatus}`);
    }

    res.status(200).json({ message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(200).json({ message: "Webhook received" });
  }
};
