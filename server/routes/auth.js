const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");

const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");

const { 
	generate2FASecret,
	verify2FAToken,
  registerUser, 
  verifyLogin2FA,
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword
 } = require("../controllers/authController");

// Generate 2FA secret for new user
router.post("/generate-2fa-secret", ensureAuth, generate2FASecret);

// Verify 2FA token and complete registration
router.post("/verify-2fa", ensureAuth, verify2FAToken);

router.post("/verify-login-2fa", verifyLogin2FA);

router.post("/register", registerLimiter, registerUser);

router.post("/login", loginLimiter, loginUser);

// Logout
router.post("/logout", ensureAuth, logoutUser);

router.post("/forget_password", forgetPassword);

// Reset password (e.g. via email link)
router.post("/resetPassword", resetPassword);

module.exports = router;
