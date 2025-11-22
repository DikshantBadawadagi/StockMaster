const express = require('express');
const router = express.Router();
const stockAdjustmentController = require('../controllers/stockAdjustment.controller');
const {protect} = require('../middleware/auth');

/**
 * Stock Adjustment Routes
 * All routes are protected with JWT authentication
 */

// Create a new stock adjustment (DRAFT status)
router.post('/create', protect, stockAdjustmentController.createStockAdjustment);

// Add item to stock adjustment
router.post('/add-item', protect, stockAdjustmentController.addAdjustmentItem);

// Validate stock adjustment (update stock)
router.post('/validate', protect, stockAdjustmentController.validateStockAdjustment);

// Get stock adjustment details with items
router.get('/:stock_adjustment_id', protect, stockAdjustmentController.getAdjustmentDetails);

// Get all stock adjustments with pagination
router.get('/', protect, stockAdjustmentController.getAllStockAdjustments);

// Get adjustment summary
router.get('/summary/overview', protect, stockAdjustmentController.getAdjustmentSummary);

module.exports = router;