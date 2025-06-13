//controller/sparePartRequestController
const { SparePartRequest, SparePart, User, Vehicle } = require('../model');
const { v4: uuidv4 } = require('uuid');

const createSparePartRequest = async (req, res) => {
  const { sparePartId, vehicleId, mechanicId, quantity, totalPrice } = req.body;

  try {
    if (!SparePartRequest || !SparePart || !User || !Vehicle) {
      console.error('Required models are not defined');
      return res.status(500).json({ message: 'Server error: Models not found' });
    }

    // Validate input
    if (!sparePartId || !vehicleId || !mechanicId || !quantity || totalPrice == null) {
      return res.status(400).json({ message: 'SparePartId, vehicleId, mechanicId, quantity, and totalPrice are required' });
    }
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be positive' });
    }
    if (totalPrice < 0) {
      return res.status(400).json({ message: 'Total price must be non-negative' });
    }

    // Verify spare part exists and has sufficient stock
    const sparePart = await SparePart.findByPk(sparePartId);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    if (sparePart.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Validate totalPrice server-side
    const expectedTotalPrice = (sparePart.price || 0) * quantity;
    if (parseFloat(totalPrice).toFixed(2) !== expectedTotalPrice.toFixed(2)) {
      return res.status(400).json({ message: 'Invalid total price' });
    }

    // Verify vehicle and mechanic exist
    const vehicle = await Vehicle.findByPk(vehicleId);
    const mechanic = await User.findByPk(mechanicId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (!mechanic || mechanic.role !== 'mechanic') {
      return res.status(400).json({ message: 'Invalid mechanic' });
    }

    // Create request
    const request = await SparePartRequest.create({
      id: uuidv4(),
      sparePartId,
      vehicleId,
      mechanicId,
      quantity,
      totalPrice: parseFloat(totalPrice).toFixed(2),
      status: 'Pending',
    });

    return res.status(201).json({ message: 'Spare part request created successfully', request });
  } catch (error) {
    console.error('Error creating spare part request:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllSparePartRequests = async (req, res) => {
  try {
    if (!SparePartRequest) {
      console.error('SparePartRequest model is not defined');
      return res.status(500).json({ message: 'Server error: SparePartRequest model not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    const requests = await SparePartRequest.findAll({
      attributes: ['id', 'sparePartId', 'vehicleId', 'mechanicId', 'quantity', 'totalPrice', 'status', 'createdAt', 'updatedAt'],
      include: [
        { model: SparePart, as: 'sparePart', attributes: ['name', 'price', 'quantity'] },
        { model: Vehicle, as: 'vehicle', attributes: ['make', 'model', 'plate'] },
        { model: User, as: 'mechanic', attributes: ['username', 'email'] },
      ],
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching spare part requests:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSparePartRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!SparePartRequest || !SparePart) {
      console.error('Required models are not defined');
      return res.status(500).json({ message: 'Server error: Models not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    // Validate input
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }

    const request = await SparePartRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: 'Spare part request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Only Pending requests can be updated' });
    }

    // If approving, update spare part quantity
    if (status === 'Approved') {
      const sparePart = await SparePart.findByPk(request.sparePartId);
      if (!sparePart) {
        return res.status(404).json({ message: 'Spare part not found' });
      }
      if (sparePart.quantity < request.quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      // Use transaction to ensure atomicity
      const transaction = await SparePartRequest.sequelize.transaction();
      try {
        sparePart.quantity -= request.quantity;
        await sparePart.save({ transaction });
        request.status = status;
        await request.save({ transaction });
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } else {
      // For Rejected, just update status
      request.status = status;
      await request.save();
    }

    return res.status(200).json({ message: `Spare part request ${status.toLowerCase()} successfully`, request });
  } catch (error) {
    console.error('Error updating spare part request status:', error.stack);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createSparePartRequest,
  getAllSparePartRequests,
  updateSparePartRequestStatus,
};