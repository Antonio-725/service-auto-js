// //routes/serviceRoutes.js

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { 
  createService, 
  getUserServices, 
  getAllServicedVehicles, 
  updateServiceAssignment,
  getAssignedServicesToMechanic,
  rateService // ← Add this
} = require('../controllers/serviceController');

router.post('/', authenticate, createService);
router.get('/', authenticate, getUserServices);
router.get('/all-vehicles', authenticate, getAllServicedVehicles);
router.get('/mechanic', authenticate, getAssignedServicesToMechanic);
router.put('/:serviceId/assign', authenticate, updateServiceAssignment);

// 👇 New route: Rate a service
router.patch('/:serviceId/rate', authenticate, rateService);

module.exports = router;