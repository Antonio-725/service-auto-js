// routes/vehicleRoutes.js

const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");
const { authenticate } = require("../middleware/auth");

// All vehicle routes require authentication
router.post("/", authenticate, vehicleController.addVehicle);
router.get("/", authenticate, vehicleController.getUserVehicles);

module.exports = router;