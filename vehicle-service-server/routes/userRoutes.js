// routes/userRoutes.js
// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { getProfile, updateProfile ,getUsers} = require("../controllers/userController");

router.get("/me", authenticate, getProfile);
router.put("/:id", authenticate, updateProfile);

// New register route
router.post("/register", require("../controllers/registerController")); // 👈 New line
router.get("/", authenticate, getUsers); // 👈 Add this route


module.exports = router;