function build(success, message, data) {
  const res = { success };
  if (message !== undefined) res.message = message;
  if (data !== undefined) res.data = data;
  return res;
}

module.exports = {
  success: (res, data, message = "success", status = 200) =>
    res.status(status).json(build(true, message, data)),

  error: (res, message = "error", status = 400, error) => {
    const payload = build(false, message);
    if (error !== undefined) payload.error = error;
    return res.status(status).json(payload);
  },
};
