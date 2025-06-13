// const express = require('express');
// const router = express.Router();
// const { authenticate } = require('../middleware/auth');
// const {
//   createSparePartRequest,
//   getAllSparePartRequests,
//   updateSparePartRequestStatus,
// } = require('../controllers/sparePartRequestController');

// // Routes
// router.post('/', authenticate, createSparePartRequest);
// router.get('/', authenticate, getAllSparePartRequests);
// router.patch('/:id/status', authenticate, updateSparePartRequestStatus);

// module.exports = router;

// routes/sparePartRequestRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createSparePartRequest,
  getAllSparePartRequests,
  updateSparePartRequestStatus,
} = require('../controllers/sparePartRequestController');

// POST - Create new request
router.post('/', authenticate, createSparePartRequest);

// GET - Get all requests (admin only)
router.get('/', authenticate, getAllSparePartRequests);

// PATCH - Update request status (admin only)
router.patch('/:id/status', authenticate, updateSparePartRequestStatus);

// NEW: GET - Get requests by mechanic ID
router.get('/mechanic', authenticate, async (req, res) => {
  try {
    const { SparePartRequest } = require('../model'); // Avoid circular dep issues

    if (!SparePartRequest) {
      return res.status(500).json({ message: 'Server error: Models not found' });
    }

    const mechanicId = req.user.id;

    const requests = await SparePartRequest.findAll({
      where: { mechanicId },
      attributes: ['id', 'sparePartId', 'vehicleId', 'quantity', 'totalPrice', 'status', 'createdAt'],
      include: [
        {
          model: require('../model').SparePart,
          as: 'sparePart',
          attributes: ['name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching mechanic requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;