const Warehouse = require('../models/Warehouse.model');
const Location = require('../models/Location.model');

// @desc    Create new warehouse
// @route   POST /api/warehouses
// @access  Private
exports.createWarehouse = async (req, res, next) => {
    try {
        const { name, code, address } = req.body;

        // Check if warehouse with code already exists
        const existingWarehouse = await Warehouse.findOne({ code });
        if (existingWarehouse) {
            return res.status(400).json({
                success: false,
                message: 'Warehouse with this code already exists'
            });
        }

        const warehouse = await Warehouse.create({
            name,
            code,
            address
        });

        res.status(201).json({
            success: true,
            data: warehouse
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all warehouses
// @route   GET /api/warehouses
// @access  Private
exports.getWarehouses = async (req, res, next) => {
    try {
        const warehouses = await Warehouse.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: warehouses.length,
            data: warehouses
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single warehouse by ID
// @route   GET /api/warehouses/:id
// @access  Private
exports.getWarehouse = async (req, res, next) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);

        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: 'Warehouse not found'
            });
        }

        res.status(200).json({
            success: true,
            data: warehouse
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
// @access  Private
exports.updateWarehouse = async (req, res, next) => {
    try {
        const { name, code, address } = req.body;

        let warehouse = await Warehouse.findById(req.params.id);

        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: 'Warehouse not found'
            });
        }

        // Check if code is being changed and if new code already exists
        if (code && code !== warehouse.code) {
            const existingWarehouse = await Warehouse.findOne({ code });
            if (existingWarehouse) {
                return res.status(400).json({
                    success: false,
                    message: 'Warehouse with this code already exists'
                });
            }
        }

        warehouse = await Warehouse.findByIdAndUpdate(
            req.params.id,
            { name, code, address },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: warehouse
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete warehouse
// @route   DELETE /api/warehouses/:id
// @access  Private
exports.deleteWarehouse = async (req, res, next) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);

        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: 'Warehouse not found'
            });
        }

        // Check if warehouse has locations
        const locationsCount = await Location.countDocuments({ warehouse_id: req.params.id });
        if (locationsCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete warehouse with existing locations'
            });
        }

        await warehouse.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Warehouse deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create location (rack/shelf/bin) in warehouse
// @route   POST /api/warehouses/:warehouseId/locations
// @access  Private
exports.createLocation = async (req, res, next) => {
    try {
        const { name, code, parent_location_id } = req.body;
        const warehouse_id = req.params.warehouseId;

        // Check if warehouse exists
        const warehouse = await Warehouse.findById(warehouse_id);
        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: 'Warehouse not found'
            });
        }

        // Check if location code already exists in this warehouse
        const existingLocation = await Location.findOne({ warehouse_id, code });
        if (existingLocation) {
            return res.status(400).json({
                success: false,
                message: 'Location with this code already exists in the warehouse'
            });
        }

        // If parent_location_id is provided, verify it exists and belongs to same warehouse
        if (parent_location_id) {
            const parentLocation = await Location.findById(parent_location_id);
            if (!parentLocation) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent location not found'
                });
            }
            if (parentLocation.warehouse_id.toString() !== warehouse_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Parent location must belong to the same warehouse'
                });
            }
        }

        const location = await Location.create({
            warehouse_id,
            name,
            code,
            parent_location_id: parent_location_id || null
        });

        const populatedLocation = await Location.findById(location._id)
            .populate('warehouse_id', 'name code')
            .populate('parent_location_id', 'name code');

        res.status(201).json({
            success: true,
            data: populatedLocation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all locations for a warehouse
// @route   GET /api/warehouses/:warehouseId/locations
// @access  Private
exports.getWarehouseLocations = async (req, res, next) => {
    try {
        const warehouse_id = req.params.warehouseId;

        // Check if warehouse exists
        const warehouse = await Warehouse.findById(warehouse_id);
        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: 'Warehouse not found'
            });
        }

        const locations = await Location.find({ warehouse_id, is_active: true })
            .populate('parent_location_id', 'name code')
            .sort({ code: 1 });

        res.status(200).json({
            success: true,
            count: locations.length,
            data: locations
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get location hierarchy (tree structure)
// @route   GET /api/warehouses/:warehouseId/locations/hierarchy
// @access  Private
exports.getLocationHierarchy = async (req, res, next) => {
    try {
        const warehouse_id = req.params.warehouseId;

        // Check if warehouse exists
        const warehouse = await Warehouse.findById(warehouse_id);
        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: 'Warehouse not found'
            });
        }

        // Get all locations for the warehouse
        const locations = await Location.find({ warehouse_id, is_active: true });

        // Build hierarchy tree
        const buildTree = (parentId = null) => {
            return locations
                .filter(loc => {
                    if (parentId === null) {
                        return loc.parent_location_id === null || loc.parent_location_id === undefined;
                    }
                    return loc.parent_location_id && loc.parent_location_id.toString() === parentId.toString();
                })
                .map(loc => ({
                    _id: loc._id,
                    name: loc.name,
                    code: loc.code,
                    warehouse_id: loc.warehouse_id,
                    parent_location_id: loc.parent_location_id,
                    is_active: loc.is_active,
                    children: buildTree(loc._id)
                }));
        };

        const hierarchy = buildTree();

        res.status(200).json({
            success: true,
            data: {
                warehouse: {
                    _id: warehouse._id,
                    name: warehouse.name,
                    code: warehouse.code
                },
                locations: hierarchy
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single location by ID
// @route   GET /api/warehouses/:warehouseId/locations/:locationId
// @access  Private
exports.getLocation = async (req, res, next) => {
    try {
        const { warehouseId, locationId } = req.params;

        const location = await Location.findOne({
            _id: locationId,
            warehouse_id: warehouseId
        })
            .populate('warehouse_id', 'name code')
            .populate('parent_location_id', 'name code');

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        res.status(200).json({
            success: true,
            data: location
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update location
// @route   PUT /api/warehouses/:warehouseId/locations/:locationId
// @access  Private
exports.updateLocation = async (req, res, next) => {
    try {
        const { warehouseId, locationId } = req.params;
        const { name, code, parent_location_id, is_active } = req.body;

        let location = await Location.findOne({
            _id: locationId,
            warehouse_id: warehouseId
        });

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        // Check if code is being changed and if new code already exists
        if (code && code !== location.code) {
            const existingLocation = await Location.findOne({ warehouse_id: warehouseId, code });
            if (existingLocation) {
                return res.status(400).json({
                    success: false,
                    message: 'Location with this code already exists in the warehouse'
                });
            }
        }

        // If parent_location_id is being changed, verify it exists and belongs to same warehouse
        if (parent_location_id && parent_location_id !== location.parent_location_id?.toString()) {
            const parentLocation = await Location.findById(parent_location_id);
            if (!parentLocation) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent location not found'
                });
            }
            if (parentLocation.warehouse_id.toString() !== warehouseId) {
                return res.status(400).json({
                    success: false,
                    message: 'Parent location must belong to the same warehouse'
                });
            }
            // Prevent circular reference
            if (parent_location_id === locationId) {
                return res.status(400).json({
                    success: false,
                    message: 'Location cannot be its own parent'
                });
            }
        }

        location = await Location.findByIdAndUpdate(
            locationId,
            { name, code, parent_location_id, is_active },
            { new: true, runValidators: true }
        )
            .populate('warehouse_id', 'name code')
            .populate('parent_location_id', 'name code');

        res.status(200).json({
            success: true,
            data: location
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete location
// @route   DELETE /api/warehouses/:warehouseId/locations/:locationId
// @access  Private
exports.deleteLocation = async (req, res, next) => {
    try {
        const { warehouseId, locationId } = req.params;

        const location = await Location.findOne({
            _id: locationId,
            warehouse_id: warehouseId
        });

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        // Check if location has child locations
        const childLocationsCount = await Location.countDocuments({ parent_location_id: locationId });
        if (childLocationsCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete location with child locations'
            });
        }

        // Soft delete by setting is_active to false
        location.is_active = false;
        await location.save();

        res.status(200).json({
            success: true,
            message: 'Location deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
