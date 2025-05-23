//routes/serviceRoutes.js

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createService, getUserServices } = require('../controllers/serviceController');

// Create a new service (vehicle owner)
router.post('/', authenticate, createService);

// Get all services for the authenticated user's vehicles
router.get('/', authenticate, getUserServices);

module.exports = router;