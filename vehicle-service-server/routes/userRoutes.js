// routes/userRoutes.js
// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { getProfile, updateProfile } = require("../controllers/userController");

router.get("/me", authenticate, getProfile);
router.put("/:id", authenticate, updateProfile);

// New register route
router.post("/register", require("../controllers/registerController")); // 👈 New line


module.exports = router;