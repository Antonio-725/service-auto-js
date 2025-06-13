// //routes/serviceRoutes.js

// const express = require('express');
// const router = express.Router();
// const { authenticate } = require('../middleware/auth');
// const { createService, getUserServices, getAllServicedVehicles, updateServiceAssignment } = require('../controllers/serviceController');

// // Create a new service (vehicle owner)
// router.post('/', authenticate, createService);

// // Get all services for the authenticated user's vehicles
// router.get('/', authenticate, getUserServices);

// // Get all serviced vehicles (admin)
// router.get('/all-vehicles', authenticate, getAllServicedVehicles);

// // Update service assignment and status (admin)
// router.put('/:serviceId/assign', authenticate, updateServiceAssignment);


// module.exports = router;


// routes/serviceRoutes.js

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { 
  createService, 
  getUserServices, 
  getAllServicedVehicles, 
  updateServiceAssignment,
  getAssignedServicesToMechanic // ← Add this
} = require('../controllers/serviceController');

router.post('/', authenticate, createService);
router.get('/', authenticate, getUserServices);
router.get('/all-vehicles', authenticate, getAllServicedVehicles);

// 👇 New route: Get services assigned to mechanic
router.get('/mechanic', authenticate, getAssignedServicesToMechanic);

router.put('/:serviceId/assign', authenticate, updateServiceAssignment);

module.exports = router;