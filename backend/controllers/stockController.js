import mongoose from 'mongoose';
import InventoryBalance from '../models/InventoryBalance.model.js';
import Product from '../models/Product.model.js';
import Warehouse from '../models/Warehouse.model.js';
import Location from '../models/Location.model.js';

// @desc    Get stock overview - all products with their quantities across locations
// @route   GET /api/stock/overview
// @access  Private
export const getStockOverview = async (req, res, next) => {
    try {
        const { warehouse_id, product_id, has_stock } = req.query;

        // Build query
        let query = {};

        if (warehouse_id) {
            query.warehouse_id = warehouse_id;
        }

        if (product_id) {
            query.product_id = product_id;
        }

        // Filter for locations with stock only
        if (has_stock === 'true') {
            query.quantity_on_hand = { $gt: 0 };
        }

        const stockBalances = await InventoryBalance.find(query)
            .populate('product_id', 'name sku code uom category_id')
            .populate('warehouse_id', 'name code address')
            .populate('location_id', 'name code parent_location_id')
            .sort({ warehouse_id: 1, product_id: 1, location_id: 1 });

        // Calculate summary statistics
        const totalLocations = stockBalances.length;
        const locationsWithStock = stockBalances.filter(b => b.quantity_on_hand > 0).length;

        res.status(200).json({
            success: true,
            count: stockBalances.length,
            summary: {
                total_locations: totalLocations,
                locations_with_stock: locationsWithStock,
                locations_empty: totalLocations - locationsWithStock
            },
            data: stockBalances
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get stock by warehouse - grouped view
// @route   GET /api/stock/by-warehouse
// @access  Private
export const getStockByWarehouse = async (req, res, next) => {
    try {
        const { warehouse_id } = req.query;

        let matchQuery = {};
        if (warehouse_id) {
            matchQuery.warehouse_id = mongoose.Types.ObjectId(warehouse_id);
        }

        // Aggregate stock by warehouse
        const stockByWarehouse = await InventoryBalance.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$warehouse_id',
                    total_quantity: { $sum: '$quantity_on_hand' },
                    product_count: { $addToSet: '$product_id' },
                    location_count: { $sum: 1 }
                }
            },
            {
                $project: {
                    warehouse_id: '$_id',
                    total_quantity: 1,
                    unique_products: { $size: '$product_count' },
                    location_count: 1,
                    _id: 0
                }
            }
        ]);

        // Populate warehouse details
        for (let stock of stockByWarehouse) {
            const warehouse = await Warehouse.findById(stock.warehouse_id);
            stock.warehouse = warehouse ? {
                _id: warehouse._id,
                name: warehouse.name,
                code: warehouse.code,
                address: warehouse.address
            } : null;
        }

        res.status(200).json({
            success: true,
            count: stockByWarehouse.length,
            data: stockByWarehouse
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get stock by product - all locations for each product
// @route   GET /api/stock/by-product
// @access  Private
export const getStockByProduct = async (req, res, next) => {
    try {
        const { category_id, search } = req.query;

        // Build product query
        let productQuery = { is_active: true };

        if (category_id) {
            productQuery.category_id = category_id;
        }

        if (search) {
            productQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(productQuery)
            .populate('category_id', 'name code')
            .lean();

        // Get stock balances for each product
        const productStocks = await Promise.all(
            products.map(async (product) => {
                const balances = await InventoryBalance.find({ product_id: product._id })
                    .populate('warehouse_id', 'name code')
                    .populate('location_id', 'name code')
                    .lean();

                const totalQuantity = balances.reduce((sum, b) => sum + b.quantity_on_hand, 0);
                const availableLocations = balances.filter(b => b.quantity_on_hand > 0).length;

                return {
                    product: {
                        _id: product._id,
                        name: product.name,
                        sku: product.sku,
                        code: product.code,
                        uom: product.uom,
                        category: product.category_id
                    },
                    total_quantity: totalQuantity,
                    available_locations: availableLocations,
                    stock_locations: balances
                };
            })
        );

        res.status(200).json({
            success: true,
            count: productStocks.length,
            data: productStocks
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get stock by location - detailed view of a specific location
// @route   GET /api/stock/by-location/:locationId
// @access  Private
export const getStockByLocation = async (req, res, next) => {
    try {
        const { locationId } = req.params;

        // Verify location exists
        const location = await Location.findById(locationId)
            .populate('warehouse_id', 'name code address')
            .populate('parent_location_id', 'name code');

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        const stockBalances = await InventoryBalance.find({ location_id: locationId })
            .populate('product_id', 'name sku code uom category_id')
            .sort({ product_id: 1 });

        const totalQuantity = stockBalances.reduce((sum, b) => sum + b.quantity_on_hand, 0);
        const productsWithStock = stockBalances.filter(b => b.quantity_on_hand > 0).length;

        res.status(200).json({
            success: true,
            data: {
                location: {
                    _id: location._id,
                    name: location.name,
                    code: location.code,
                    warehouse: location.warehouse_id,
                    parent_location: location.parent_location_id,
                    is_active: location.is_active
                },
                summary: {
                    total_products: stockBalances.length,
                    products_with_stock: productsWithStock,
                    total_quantity: totalQuantity
                },
                stock: stockBalances
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get product availability listing - quick view of product availability
// @route   GET /api/stock/availability
// @access  Private
export const getProductAvailability = async (req, res, next) => {
    try {
        const { warehouse_id, low_stock_threshold } = req.query;

        let matchQuery = { quantity_on_hand: { $gt: 0 } };

        if (warehouse_id) {
            matchQuery.warehouse_id = mongoose.Types.ObjectId(warehouse_id);
        }

        // Aggregate available products
        const availability = await InventoryBalance.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$product_id',
                    total_quantity: { $sum: '$quantity_on_hand' },
                    warehouse_count: { $addToSet: '$warehouse_id' },
                    location_count: { $sum: 1 }
                }
            },
            {
                $project: {
                    product_id: '$_id',
                    total_quantity: 1,
                    available_in_warehouses: { $size: '$warehouse_count' },
                    available_in_locations: '$location_count',
                    _id: 0
                }
            }
        ]);

        // Populate product details
        for (let item of availability) {
            const product = await Product.findById(item.product_id)
                .populate('category_id', 'name code')
                .lean();

            if (product) {
                item.product = {
                    _id: product._id,
                    name: product.name,
                    sku: product.sku,
                    code: product.code,
                    uom: product.uom,
                    category: product.category_id
                };

                // Check if low stock (if threshold provided)
                if (low_stock_threshold) {
                    item.is_low_stock = item.total_quantity <= parseInt(low_stock_threshold);
                }
            }
        }

        // Filter out items where product doesn't exist
        const validAvailability = availability.filter(item => item.product);

        // Sort by total quantity descending
        validAvailability.sort((a, b) => b.total_quantity - a.total_quantity);

        res.status(200).json({
            success: true,
            count: validAvailability.length,
            data: validAvailability
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get warehouse stock summary
// @route   GET /api/stock/warehouse/:warehouseId/summary
// @access  Private
export const getWarehouseStockSummary = async (req, res, next) => {
    try {
        const { warehouseId } = req.params;

        // Verify warehouse exists
        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: 'Warehouse not found'
            });
        }

        // Get all stock in warehouse
        const stockBalances = await InventoryBalance.find({ warehouse_id: warehouseId })
            .populate('product_id', 'name sku code')
            .populate('location_id', 'name code');

        const totalQuantity = stockBalances.reduce((sum, b) => sum + b.quantity_on_hand, 0);
        const uniqueProducts = [...new Set(stockBalances.map(b => b.product_id._id.toString()))].length;
        const locationsWithStock = stockBalances.filter(b => b.quantity_on_hand > 0).length;

        res.status(200).json({
            success: true,
            data: {
                warehouse: {
                    _id: warehouse._id,
                    name: warehouse.name,
                    code: warehouse.code,
                    address: warehouse.address
                },
                summary: {
                    total_quantity: totalQuantity,
                    unique_products: uniqueProducts,
                    total_locations: stockBalances.length,
                    locations_with_stock: locationsWithStock
                },
                stock: stockBalances
            }
        });
    } catch (error) {
        next(error);
    }
};
