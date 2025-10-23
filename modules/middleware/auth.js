const jwt = require("jsonwebtoken");
const R = require("../common/response");

module.exports = function auth(req, res, next) {
  try {
    const header = req.headers["authorization"] || "";
    const parts = header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return R.error(res, "Unauthorized", 401);
    }
    const token = parts[1];
    const secret = process.env.JWT_SECRET || "dev-secret";
    const decoded = jwt.verify(token, secret);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return R.error(res, "Unauthorized", 401);
  }
};
