const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { success, created, error } = require("../utils/response");

// ── Token helpers ─────────────────────────────────────────────

const signAccess = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, email: user.email, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" },
  );

const signRefresh = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });

const generateTokenPair = async (user) => {
  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user._id);
  user.refreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  const allowedRoles = ["customer", "dealer"];
  const userRole = allowedRoles.includes(role) ? role : "customer";

  const existing = await User.findOne({ phone });
  if (existing) throw new AppError("Phone number already registered.", 409);

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: userRole,
  });
  const { accessToken, refreshToken } = await generateTokenPair(user);

  return created(
    res,
    { user, accessToken, refreshToken },
    "Registration successful",
  );
});

const login = asyncHandler(async (req, res) => {
  const { phoneOrEmail, password } = req.body;
  const query = phoneOrEmail.includes("@")
    ? { email: phoneOrEmail }
    : { phone: phoneOrEmail };
  const user = await User.findOne(query).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid credentials.", 401);
  }
  if (!user.isActive)
    throw new AppError("Account deactivated. Contact support.", 403);

  const { accessToken, refreshToken } = await generateTokenPair(user);
  return success(res, { user, accessToken, refreshToken }, "Login successful");
});

/* // ── POST /auth/otp/send ───────────────────────────────────────

exports.sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await OTP.deleteMany({ phone }); // clear old OTPs
  await OTP.create({ phone, otp, expiresAt });

  // TODO: Send via MSG91/Twilio in production
  // await smsService.send(phone, `Your AutoParts OTP is ${otp}. Valid for 10 mins.`);

  if (process.env.NODE_ENV === "development") {
    console.log(`📱 OTP for ${phone}: ${otp}`);
    return success(res, { otp }, "OTP sent (dev mode)");
  }
  return success(res, {}, "OTP sent successfully");
});

// ── POST /auth/otp/verify ─────────────────────────────────────

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  const record = await OTP.findOne({ phone, verified: false });

  if (!record) throw new AppError("OTP not found or already used.", 400);
  if (record.expiresAt < new Date())
    throw new AppError("OTP has expired.", 400);
  if (record.attempts >= 5)
    throw new AppError("Too many failed attempts. Request a new OTP.", 429);
  if (record.otp !== otp) {
    record.attempts += 1;
    await record.save();
    throw new AppError("Invalid OTP.", 400);
  }

  record.verified = true;
  await record.save();

  // Auto-create user if first time
  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ name: "User", phone, isVerified: true });
  } else {
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });
  }

  const { accessToken, refreshToken } = await generateTokenPair(user);
  return success(
    res,
    { user: user.toSafeObject(), accessToken, refreshToken },
    "OTP verified",
  );
}); */

// ── POST /auth/refresh ────────────────────────────────────────

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError("Refresh token required.", 400);

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError("Invalid refresh token.", 401);
  }

  const hashed = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const user = await User.findOne({
    _id: decoded.id,
    refreshToken: hashed,
  }).select("+refreshToken");
  if (!user) throw new AppError("Token revoked or user not found.", 401);

  const { accessToken, refreshToken: newRefresh } =
    await generateTokenPair(user);
  return success(res, { accessToken, refreshToken: newRefresh });
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
  return success(res, {}, "Logged out successfully");
});

// ── GET /auth/me ──────────────────────────────────────────────

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError("User not found.", 404);
  return success(res, { user: user.toSafeObject() });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};
