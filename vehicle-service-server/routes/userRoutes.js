// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { getUserProfile } = require("../controllers/auth.controller");

router.get("/me", authenticate, getUserProfile);

module.exports = router;