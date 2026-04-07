import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../db.js";
import AppError from "../utils/AppError.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import { emailQueue } from "../queues/email.queue.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError("Email sudah digunakan", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      omit: { password: true },
    });

    emailQueue.add("send-welcome-email", {
      email: newUser.email,
      name: newUser.name,
    });

    sendCreated(res, newUser, "Registrasi berhasil");
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new AppError("Email atau password salah", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Email atau password salah", 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    const { password: _, ...userWithoutPassword } = user;

    sendSuccess(res, { token, user: userWithoutPassword }, "Login berhasil");
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) throw new AppError("User tidak ditemukan", 404);

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};
