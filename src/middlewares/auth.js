const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Not authenticated. Token missing.", 401));
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("User not found.", 401));
    }

    req.user = user;
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
