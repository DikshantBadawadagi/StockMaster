const express = require('express');
const router = express.Router();
const {
    getStockOverview,
    getStockByWarehouse,
    getStockByProduct,
    getStockByLocation,
    getProductAvailability,
    getWarehouseStockSummary
} = require('../controllers/stockController');
const { protect } = require('../middleware/auth');

// Stock view routes (all read-only)
router.get('/overview', protect, getStockOverview);
router.get('/by-warehouse', protect, getStockByWarehouse);
router.get('/by-product', protect, getStockByProduct);
router.get('/by-location/:locationId', protect, getStockByLocation);
router.get('/availability', protect, getProductAvailability);
router.get('/warehouse/:warehouseId/summary', protect, getWarehouseStockSummary);

module.exports = router;
