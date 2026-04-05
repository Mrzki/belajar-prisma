import { success } from "zod";

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Terjadi kesalahan server";

  if (err.code === "P2025") {
    statusCode = 404;
    message = "Data tidak ditemukan";
  }

  if (err.code === "P2002") {
    statusCode = 4000;
    message = "Data sudah digunakan";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token tidak valid";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 41;
    message = "Token sudah expired, silahkan login ulang";
  }

  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

export default errorHandler;
