import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, "Nama produk minimal 2 karakter")
    .max(100, "Nama produk maksimal 100 karakter"),
  price: z
    .number()
    .int("Harga harus bilangan bulat")
    .positive("Harga harus lebih dari 0"),
  stock: z
    .number()
    .int("Stok harus bilangan bulat")
    .min(0, "Stok tidak boleh negatif"),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  price: z.number().int().positive().optional(),
  stock: z.number().int().min(0).optional(),
});
