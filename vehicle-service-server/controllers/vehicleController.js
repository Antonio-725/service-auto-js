// controllers/vehicleController.js

const { Vehicle } = require('../model');

// Add a new vehicle
const addVehicle = async (req, res) => {
  const { make, model, year, plate } = req.body;

  // Get userId from authenticated user
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

module.exports = {
  addVehicle,
  getUserVehicles,
};