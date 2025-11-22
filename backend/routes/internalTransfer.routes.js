const express = require('express');
const router = express.Router();
const internalTransferController = require('../controllers/internalTransfer.controller');
const {protect} = require('../middleware/auth');

/**
 * Internal Transfer Routes
 * All routes are protected with JWT authentication
 */

// Create a new internal transfer (DRAFT status)
router.post('/create', protect, internalTransferController.createInternalTransfer);

// Add item to internal transfer
router.post('/add-item', protect, internalTransferController.addTransferItem);

// Validate internal transfer (create dual ledger entries)
router.post('/validate', protect, internalTransferController.validateInternalTransfer);

// Get internal transfer details with items
router.get('/:internal_transfer_id', protect, internalTransferController.getTransferDetails);

// Get all internal transfers with pagination
router.get('/', protect, internalTransferController.getAllInternalTransfers);

module.exports = router;