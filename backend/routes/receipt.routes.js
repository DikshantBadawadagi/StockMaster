const express = require('express');
const router = express.Router();
const {createReceipt, addReceiptItem, validateReceipt, getReceiptDetails, getAllReceipts} = require('../controllers/receipt.controller.js');
const { protect } = require('../middleware/auth');

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

module.exports = router;