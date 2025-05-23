// routes/vehicleRoutes.js

const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");
const { authenticate } = require("../middleware/auth");

// All vehicle routes require authentication
router.use(authenticate);

// CRUD Endpoints
router.post("/", vehicleController.addVehicle);                 // POST /api/vehicles
router.get("/", vehicleController.getUserVehicles);             // GET /api/vehicles
router.get("/:id", vehicleController.getVehicleById);           // GET /api/vehicles/:id
router.put("/:id", vehicleController.updateVehicle);            // PUT /api/vehicles/:id
router.delete("/:id", vehicleController.deleteVehicle);         // DELETE /api/vehicles/:id

module.exports = router;