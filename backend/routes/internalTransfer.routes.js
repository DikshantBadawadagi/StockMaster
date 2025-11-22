import express from 'express';
const router = express.Router();
import { createInternalTransfer, addTransferItem, validateInternalTransfer, getTransferDetails, getAllInternalTransfers } from '../controllers/internalTransfer.controller.js';
import { protect } from '../middleware/auth.js';

/**
 * Internal Transfer Routes
 * All routes are protected with JWT authentication
 */

// Create a new internal transfer (DRAFT status)
router.post('/create', protect, createInternalTransfer);

// Add item to internal transfer
router.post('/add-item', protect, addTransferItem);

// Validate internal transfer (create dual ledger entries)
router.post('/validate', protect, validateInternalTransfer);

// Get internal transfer details with items
router.get('/:internal_transfer_id', protect, getTransferDetails);

// Get all internal transfers with pagination
router.get('/', protect, getAllInternalTransfers);

export default router;