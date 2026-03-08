const success = (res, data = {}, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const created = (res, data = {}, message = "Created") => {
  return res.status(201).json({ success: true, message, data });
};

const error = (
  res,
  message = "Something went wrong",
  statusCode = 500,
  errors = null,
) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const paginated = (res, data, total, page, limit) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  });
};

module.exports = { success, created, error, paginated };
