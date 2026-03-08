const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

const protect = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Not authenticated. Token missing.", 401));
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email, phone }
    next();
  } catch (err) {
    return next(new AppError("Invalid or expired token.", 401));
  }
};

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403),
      );
    }
    next();
  };

module.exports = { protect, restrictTo };
