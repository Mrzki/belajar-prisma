import prisma from "../db.js";
import AppError from "../utils/AppError.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import { clearCache } from "../middlewares/cache.moddleware.js";

export const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const minPrice = parseInt(req.query.minPrice) || 0;
    const maxPrice = parseInt(req.query.maxPrice) || undefined;

    const where = {
      name: {
        contains: search,
        mode: "insensitive",
      },
      price: {
        gte: minPrice,
        ...(maxPrice && { lte: maxPrice }),
      },
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "asc" },
      }),
      prisma.product.count({ where }),
    ]);

    sendSuccess(res, {
      products,
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

export const getProductById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) throw new AppError("Product tidak ditemukan", 404);

    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, price, stock } = req.body;
    const newProduct = await prisma.product.create({
      data: { name, price, stock },
    });

    await clearCache("/api/v1/products*");

    sendCreated(res, newProduct, "Product berhasil dibuat");
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, price, stock } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { name, price, stock },
    });

    await clearCache("/api/v1/products*");

    sendSuccess(res, updatedProduct, "Produk berhasil diupdate");
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });

    await clearCache("/api/v1/products*");

    sendSuccess(res, null, "Product berhasil dihapus");
  } catch (error) {
    next(error);
  }
};
