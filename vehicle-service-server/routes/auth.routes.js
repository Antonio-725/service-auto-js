// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// GET /api/auth/profile (Protected)
router.get("/profile", authenticate, getUserProfile);

module.exports = router;