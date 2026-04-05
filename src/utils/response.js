export const sendSuccess = (
  res,
  data = null,
  message = "Berhasil",
  statusCode = 200,
) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

export const sendCreated = (res, data, message = "Data berhasil dibuat") => {
  return sendSuccess(res, data, message, 201);
};

export const sendError = (
  res,
  message = "Terjadi kesalahan",
  statusCode = 500,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
