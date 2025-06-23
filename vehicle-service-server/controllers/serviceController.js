
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

const getAllServicedVehicles = async (req, res) => {
  try {
    const services = await Service.findAll({
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'make', 'model', 'plate', 'year'],
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'username', 'phone', 'email'],
            },
          ],
        },
        {
          model: User,
          as: 'mechanic',
          attributes: ['id', 'username'],
          required: false,
        },
      ],
      attributes: ['id', 'description', 'status', 'date', 'rating', 'createdAt'],
    });

    return res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching serviced vehicles:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateServiceAssignment = async (req, res) => {
  const { serviceId } = req.params;
  const { mechanicId, status } = req.body;

  try {
    if (!Service) {
      console.error('Service model is not defined');
      return res.status(500).json({ message: 'Server error: Service model not found' });
    }

    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Validate mechanic if provided
    if (mechanicId) {
      if (!User) {
        console.error('User model is not defined');
        return res.status(500).json({ message: 'Server error: User model not found' });
      }
      const mechanic = await User.findByPk(mechanicId);
      if (!mechanic) {
        return res.status(404).json({ message: 'Mechanic not found' });
      }
    }

    // Validate status
    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided' });
    }

    // Update service
    const updateData = {};
    if (mechanicId) updateData.mechanicId = mechanicId;
    if (status) updateData.status = status;

    await service.update(updateData);

    // Fetch updated service with associations
    const updatedService = await Service.findByPk(serviceId, {
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'make', 'model', 'plate', 'year'] },
        { model: User, as: 'mechanic', attributes: ['id', 'username'], required: false },
      ],
    });

    return res.status(200).json({ message: 'Service updated successfully', service: updatedService });
  } catch (error) {
    console.error('Error updating service:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAssignedServicesToMechanic = async (req, res) => {
  const mechanicId = req.user.id;

  try {
    // Ensure models are defined
    if (!Service || !Vehicle || !User) {
      console.error('One or more models not defined:', { Service, Vehicle, User });
      return res.status(500).json({ message: 'Server error: Models not loaded' });
    }

    // Fetch services where this user is the assigned mechanic
    const services = await Service.findAll({
      where: { mechanicId },
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'make', 'model', 'plate', 'year'],
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'username', 'phone', 'email'],
            },
          ],
        },
        {
          model: User,
          as: 'mechanic',
          attributes: ['id', 'username'],
        },
      ],
      attributes: ['id', 'description', 'status', 'date', 'rating', 'createdAt'],
    });

    return res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching assigned services:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const rateService = async (req, res) => {
  const { serviceId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  try {
    // Validate input
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    // Ensure Service model is defined
    if (!Service) {
      console.error('Service model is not defined');
      return res.status(500).json({ message: 'Server error: Service model not found' });
    }

    // Find the service
    const service = await Service.findByPk(serviceId, {
      include: [
        {
          model: Vehicle,
          as: 'vehicle',
          where: { userId }, // Ensure the vehicle belongs to the user
          attributes: ['id', 'userId'],
        },
      ],
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found or you are not authorized to rate it' });
    }

    // Ensure service is completed
    if (service.status !== 'Completed') {
      return res.status(400).json({ message: 'Only completed services can be rated' });
    }

    // Update service with rating and optional comment
    await service.update({
      rating,
      comment: comment || null, // Store null if no comment provided
    });

    // Fetch updated service with associations
    const updatedService = await Service.findByPk(serviceId, {
      include: [
        { model: Vehicle, as: 'vehicle', attributes: ['id', 'make', 'model', 'plate', 'year'] },
        { model: User, as: 'mechanic', attributes: ['id', 'username'], required: false },
      ],
      attributes: ['id', 'description', 'status', 'date', 'rating', 'comment', 'createdAt'],
    });

    return res.status(200).json({ message: 'Service rated successfully', service: updatedService });
  } catch (error) {
    console.error('Error rating service:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = { 
  createService, 
  getUserServices, 
  getAllServicedVehicles, 
  updateServiceAssignment, 
  getAssignedServicesToMechanic, 
  rateService 
};