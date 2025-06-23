// routes/invoices.js
const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/invoiceController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Authenticate all routes
router.use(authenticate);

// Create invoice (admin only)
router.post('/', authorizeRoles('admin'), InvoiceController.createInvoice);

// Get invoices (all for admin, own for client)
router.get('/', InvoiceController.getInvoices);

// Update invoice status (admin only)
router.patch('/:id/status', authorizeRoles('admin'), InvoiceController.updateInvoiceStatus);

// Delete invoice (admin only)
router.delete('/:id', authorizeRoles('admin'), InvoiceController.deleteInvoice);
// Send invoice email (admin only)
router.post('/:id/send-email', authorizeRoles('admin'), InvoiceController.sendInvoiceEmail);

module.exports = router;