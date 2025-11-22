const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const {protect} = require('../middleware/auth');

/**
 * Delivery Order Routes
 * All routes are protected with JWT authentication
 */

// Create a new delivery order (DRAFT status)
router.post('/create', protect, deliveryController.createDeliveryOrder);

// Add item to delivery order
router.post('/add-item', protect, deliveryController.addDeliveryItem);

// Validate delivery order (reduce stock)
router.post('/validate', protect, deliveryController.validateDeliveryOrder);

// Get delivery order details with items
router.get('/:delivery_order_id', protect, deliveryController.getDeliveryOrderDetails);

// Get all delivery orders with pagination
router.get('/', protect, deliveryController.getAllDeliveryOrders);

module.exports = router;