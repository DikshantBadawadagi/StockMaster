import express from 'express';
const router = express.Router();
import {
	createWarehouse,
	getWarehouses,
	getWarehouse,
	updateWarehouse,
	deleteWarehouse,
	createLocation,
	getWarehouseLocations,
	getLocationHierarchy,
	getLocation,
	updateLocation,
	deleteLocation,
} from '../controllers/warehouseController.js';
import { protect } from '../middleware/auth.js';

// Warehouse routes
router.post('/', protect, createWarehouse);
router.get('/', protect, getWarehouses);
router.get('/:id', protect, getWarehouse);
router.put('/:id', protect, updateWarehouse);
router.delete('/:id', protect, deleteWarehouse);

// Location routes
router.post('/:warehouseId/locations', protect, createLocation);
router.get('/:warehouseId/locations', protect, getWarehouseLocations);
router.get('/:warehouseId/locations/hierarchy', protect, getLocationHierarchy);
router.get('/:warehouseId/locations/:locationId', protect, getLocation);
router.put('/:warehouseId/locations/:locationId', protect, updateLocation);
router.delete('/:warehouseId/locations/:locationId', protect, deleteLocation);

export default router;
