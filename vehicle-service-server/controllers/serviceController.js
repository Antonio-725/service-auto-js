
//controllers/serviceController
const { Service, Vehicle, User } = require('../model');

const createService = async (req, res) => {
  const { vehicleId, description, date } = req.body;
  const userId = req.user.id;

  try {
    // Validate input
    if (!vehicleId || !description || !date) {
      return res.status(400).json({ message: 'Vehicle ID, description, and date are required' });
    }

    // Verify vehicle belongs to the user
    if (!Vehicle) {
      console.error('Vehicle model is not defined');
      return res.status(500).json({ message: 'Server error: Vehicle model not found' });
    }
    const vehicle = await Vehicle.findOne({ where: { id: vehicleId, userId } });
    if (!vehicle) {
      return res.status(403).json({ message: 'Vehicle not found or does not belong to you' });
    }

    // Create service with Pending status and no mechanic assigned
    if (!Service) {
      console.error('Service model is not defined');
      return res.status(500).json({ message: 'Server error: Service model not found' });
    }
    const service = await Service.create({
      vehicleId,
      description,
      date,
      status: 'Pending',
    });

    return res.status(201).json({ message: 'Service booked successfully', service });
  } catch (error) {
    console.error('Error creating service:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserServices = async (req, res) => {
  const userId = req.user.id;

  try {
    if (!Service || !Vehicle || !User) {
      console.error('One or more models are not defined:', { Service, Vehicle, User });
      return res.status(500).json({ message: 'Server error: One or more models not found', details: { Service: !!Service, Vehicle: !!Vehicle, User: !!User } });
    }

    // Fetch services for vehicles owned by the user
    const services = await Service.findAll({
      include: [
        { model: Vehicle, as: 'vehicle', where: { userId } },
        { model: User, as: 'mechanic', attributes: ['id', 'username'], required: false },
      ],
    });

    return res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createService, getUserServices };