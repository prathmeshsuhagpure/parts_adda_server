const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const {
  login,
  register,
  refreshToken,
  logout,
  getMe,
} = require("../controllers/authController");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/auth");

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("phone")
      .trim()
      .matches(/^[6-9]\d{9}$/)
      .withMessage("Valid Indian mobile number required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("email").optional().isEmail().withMessage("Valid email required"),
  ],
  validate,
  register,
);

router.post(
  "/login",
  [
    body("phoneOrEmail").notEmpty().withMessage("Phone or email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate,
  login,
);

router.post("/refresh", refreshToken);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

module.exports = router;
