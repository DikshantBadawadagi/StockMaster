import express from 'express';
const router = express.Router();
import { createStockAdjustment, addAdjustmentItem, validateStockAdjustment, getAdjustmentDetails, getAllStockAdjustments, getAdjustmentSummary } from '../controllers/stockAdjustment.controller.js';
import { protect } from '../middleware/auth.js';

/**
 * Stock Adjustment Routes
 * All routes are protected with JWT authentication
 */

// Create a new stock adjustment (DRAFT status)
router.post('/create', protect, createStockAdjustment);

// Add item to stock adjustment
router.post('/add-item', protect, addAdjustmentItem);

// Validate stock adjustment (update stock)
router.post('/validate', protect, validateStockAdjustment);

// Get stock adjustment details with items
router.get('/:stock_adjustment_id', protect, getAdjustmentDetails);

// Get all stock adjustments with pagination
router.get('/', protect, getAllStockAdjustments);

// Get adjustment summary
router.get('/summary/overview', protect, getAdjustmentSummary);

export default router;