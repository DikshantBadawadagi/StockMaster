import express from 'express';
const router = express.Router();
import { createReceipt, addReceiptItem, validateReceipt, getReceiptDetails, getAllReceipts } from '../controllers/receipt.controller.js';
import { protect } from '../middleware/auth.js';

/**
 * Receipt Routes
 * All routes are protected with JWT authentication
 */

// Create a new receipt (DRAFT status)
router.post('/create', protect, createReceipt);

// Add item to receipt
router.post('/add-item', protect, addReceiptItem);

// Validate receipt (add to stock)
router.post('/validate', protect,validateReceipt);

// Get receipt details with items
router.get('/:receipt_id', protect, getReceiptDetails);

// Get all receipts with pagination
router.get('/', protect, getAllReceipts);

export default router;