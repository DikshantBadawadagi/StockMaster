import express from 'express';
const router = express.Router();
import { createDeliveryOrder, addDeliveryItem, validateDeliveryOrder, getDeliveryOrderDetails, getAllDeliveryOrders } from '../controllers/delivery.controller.js';
import { protect } from '../middleware/auth.js';

/**
 * Delivery Order Routes
 * All routes are protected with JWT authentication
 */

// Create a new delivery order (DRAFT status)
router.post('/create', protect, createDeliveryOrder);

// Add item to delivery order
router.post('/add-item', protect, addDeliveryItem);

// Validate delivery order (reduce stock)
router.post('/validate', protect, validateDeliveryOrder);

// Get delivery order details with items
router.get('/:delivery_order_id', protect, getDeliveryOrderDetails);

// Get all delivery orders with pagination
router.get('/', protect, getAllDeliveryOrders);

export default router;