// controllers/vehicleController.js

const { Vehicle } = require('../model');

// Add a new vehicle
const addVehicle = async (req, res) => {
  const { make, model, year, plate } = req.body;
  const userId = req.user.id;

  try {
    // Check if plate number already exists
    const existingVehicle = await Vehicle.findOne({ where: { plate } });
    if (existingVehicle) {
      return res.status(400).json({ message: 'Plate number already exists.' });
    }

    // Create new vehicle
    const newVehicle = await Vehicle.create({
      make,
      model,
      year,
      plate,
      userId,
    });

    return res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error adding vehicle:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get all vehicles for logged-in user
const getUserVehicles = async (req, res) => {
  const userId = req.user.id;

  try {
    const vehicles = await Vehicle.findAll({ where: { userId } });
    return res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// View single vehicle detail
const getVehicleById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const vehicle = await Vehicle.findOne({
      where: { id, userId },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    return res.json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Edit vehicle
const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { make, model, year, plate } = req.body;
  const userId = req.user.id;

  try {
    const vehicle = await Vehicle.findOne({
      where: { id, userId },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Optional: Check if plate is being changed and is unique
    if (plate && plate !== vehicle.plate) {
      const existing = await Vehicle.findOne({ where: { plate } });
      if (existing) {
        return res.status(400).json({ message: "Plate number already in use." });
      }
    }

    await vehicle.update({ make, model, year, plate });
    return res.json(vehicle);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const vehicle = await Vehicle.findOne({
      where: { id, userId },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    await vehicle.destroy();
    return res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addVehicle,
  getUserVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};