import prisma from "../db.js";
import AppError from "../utils/AppError.js";
import { sendSuccess, sendCreated } from "../utils/response.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { id: "asc" },
        omit: { password: true },
      }),
      prisma.user.count(),
    ]);
    sendSuccess(res, {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      include: { orders: true },
      omit: { password: true },
    });

    if (!user) throw new AppError("User tidak ditemukan", 404);

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) throw new AppError("Name dan email wajib diisi", 400);

    const newUser = await prisma.user.create({
      data: { name, email },
      omit: { password: true },
    });

    sendCreated(res, newUser, "User berhasil dibuat");
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email },
      omit: { password: true },
    });

    sendSuccess(res, updatedUser, "User berhasil diupdate");
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.user.delete({
      where: { id },
    });

    sendSuccess(res, null, "User berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
