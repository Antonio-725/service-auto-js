// routes/auth.routes.js
const express = require("express");
const router = express.Router();
//const { registerUser, loginUser, getUserProfile,verifyToken } = require("../controllers/auth.controller");
const { registerUser, loginUser, getUserProfile, verifyToken, verifyOtp } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// GET /api/auth/profile (Protected)
router.get("/profile", authenticate, getUserProfile);

// GET /api/auth/verify
router.get("/verify", verifyToken);
// POST /api/auth/verify-otp
router.post("/verify-otp", verifyOtp);

module.exports = router;