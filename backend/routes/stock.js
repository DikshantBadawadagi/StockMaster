import express from 'express';
const router = express.Router();
import {
	getStockOverview,
	getStockByWarehouse,
	getStockByProduct,
	getStockByLocation,
	getProductAvailability,
	getWarehouseStockSummary,
} from '../controllers/stockController.js';
import { protect } from '../middleware/auth.js';

// Stock view routes (all read-only)
router.get('/overview', protect, getStockOverview);
router.get('/by-warehouse', protect, getStockByWarehouse);
router.get('/by-product', protect, getStockByProduct);
router.get('/by-location/:locationId', protect, getStockByLocation);
router.get('/availability', protect, getProductAvailability);
router.get('/warehouse/:warehouseId/summary', protect, getWarehouseStockSummary);

export default router;
