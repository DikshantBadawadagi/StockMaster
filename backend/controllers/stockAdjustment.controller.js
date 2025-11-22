const StockAdjustment = require('../models/StockAdjustment.model');
const StockAdjustmentItem = require('../models/StockAdjustmentItem.model');
const Product = require('../models/Product.model');
const Location = require('../models/Location.model');
const Warehouse = require('../models/Warehouse.model');
const { DocumentStatus } = require('../models/DocumentStatus');
const stockLedgerService = require('../services/stockLedger.service');

/**
 * Create a new stock adjustment (DRAFT status)
 */
exports.createStockAdjustment = async (req, res) => {
  try {
    const { document_number, warehouse_id, reason, adjustment_date, remarks } = req.body;

    // Validation
    if (!document_number || !warehouse_id || !reason) {
      return res.status(400).json({
        success: false,
        message: 'document_number, warehouse_id, and reason are required',
      });
    }

    // Validate reason
    const validReasons = ['DAMAGED', 'LOSS', 'COUNT_CORRECTION', 'OTHER'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: `Invalid reason. Must be one of: ${validReasons.join(', ')}`,
      });
    }

    // Check if document_number already exists
    const existingAdjustment = await StockAdjustment.findOne({ document_number });
    if (existingAdjustment) {
      return res.status(400).json({
        success: false,
        message: 'Stock adjustment with this document_number already exists',
      });
    }

    // Check if warehouse exists
    const warehouse = await Warehouse.findById(warehouse_id);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
      });
    }

    // Create stock adjustment
    const adjustment = await StockAdjustment.create({
      document_number,
      warehouse_id,
      reason,
      adjustment_date: adjustment_date || new Date(),
      remarks,
      status: DocumentStatus.DRAFT,
    });

    res.status(201).json({
      success: true,
      message: 'Stock adjustment created successfully in DRAFT status',
      data: adjustment,
    });
  } catch (error) {
    console.error('Create stock adjustment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating stock adjustment',
      error: error.message,
    });
  }
};

/**
 * Add items to a stock adjustment
 */
exports.addAdjustmentItem = async (req, res) => {
  try {
    const { stock_adjustment_id, product_id, location_id, quantity_change, remarks } = req.body;

    // Validation
    if (!stock_adjustment_id || !product_id || !location_id || quantity_change === undefined) {
      return res.status(400).json({
        success: false,
        message: 'stock_adjustment_id, product_id, location_id, and quantity_change are required',
      });
    }

    if (quantity_change === 0) {
      return res.status(400).json({
        success: false,
        message: 'quantity_change cannot be zero',
      });
    }

    // Check if adjustment exists and is in DRAFT status
    const adjustment = await StockAdjustment.findById(stock_adjustment_id);
    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: 'Stock adjustment not found',
      });
    }

    if (adjustment.status !== DocumentStatus.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Can only add items to adjustments in DRAFT status',
      });
    }

    // Check if product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if location exists and belongs to the adjustment warehouse
    const location = await Location.findById(location_id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      });
    }

    if (location.warehouse_id.toString() !== adjustment.warehouse_id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Location does not belong to the adjustment warehouse',
      });
    }

    // Check if item already exists in adjustment
    const existingItem = await StockAdjustmentItem.findOne({
      stock_adjustment_id,
      product_id,
      location_id,
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'This product already exists in this adjustment at this location',
      });
    }

    // For LOSS adjustments, check current stock
    if (quantity_change < 0) {
      const currentStock = await stockLedgerService.getStockBalance(
        product_id,
        adjustment.warehouse_id,
        location_id
      );

      if (currentStock < Math.abs(quantity_change)) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce stock by ${Math.abs(quantity_change)}. Current stock: ${currentStock}`,
        });
      }
    }

    // Create adjustment item
    const adjustmentItem = await StockAdjustmentItem.create({
      stock_adjustment_id,
      product_id,
      location_id,
      quantity_change,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: 'Adjustment item added successfully',
      data: adjustmentItem,
    });
  } catch (error) {
    console.error('Add adjustment item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding adjustment item',
      error: error.message,
    });
  }
};

/**
 * Validate stock adjustment and update stock
 */
exports.validateStockAdjustment = async (req, res) => {
  try {
    const { stock_adjustment_id } = req.body;

    if (!stock_adjustment_id) {
      return res.status(400).json({
        success: false,
        message: 'stock_adjustment_id is required',
      });
    }

    // Check if adjustment exists
    const adjustment = await StockAdjustment.findById(stock_adjustment_id);
    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: 'Stock adjustment not found',
      });
    }

    if (adjustment.status !== DocumentStatus.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Only DRAFT adjustments can be validated',
      });
    }

    // Get all items for this adjustment
    const adjustmentItems = await StockAdjustmentItem.find({ stock_adjustment_id }).populate(
      'product_id location_id'
    );

    if (adjustmentItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment must have at least one item',
      });
    }

    // Validate all items before processing
    for (const item of adjustmentItems) {
      // For LOSS adjustments, verify stock is still available
      if (item.quantity_change < 0) {
        const currentStock = await stockLedgerService.getStockBalance(
          item.product_id._id,
          adjustment.warehouse_id,
          item.location_id._id
        );

        if (currentStock < Math.abs(item.quantity_change)) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.product_id.name}. Available: ${currentStock}, Loss Amount: ${Math.abs(item.quantity_change)}`,
          });
        }
      }
    }

    // Create ledger entries for each item
    for (const item of adjustmentItems) {
      // Determine movement type based on quantity_change
      const movementType = item.quantity_change > 0 ? 'ADJUSTMENT_POS' : 'ADJUSTMENT_NEG';

      await stockLedgerService.createLedgerEntry({
        product_id: item.product_id._id,
        warehouse_id: adjustment.warehouse_id,
        location_id: item.location_id._id,
        document_type: 'ADJUSTMENT',
        document_id: adjustment._id,
        document_line_id: item._id,
        movement_type: movementType,
        quantity: Math.abs(item.quantity_change),
        created_by: req.user._id,
        note: `Stock adjustment - Reason: ${adjustment.reason}. ${adjustment.remarks || ''}`,
      });
    }

    // Update adjustment status to DONE
    adjustment.status = DocumentStatus.DONE;
    await adjustment.save();

    res.status(200).json({
      success: true,
      message: 'Stock adjustment validated successfully. Stock updated and ledger entries created.',
      data: adjustment,
    });
  } catch (error) {
    console.error('Validate stock adjustment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating stock adjustment',
      error: error.message,
    });
  }
};

/**
 * Get stock adjustment details with items
 */
exports.getAdjustmentDetails = async (req, res) => {
  try {
    const { stock_adjustment_id } = req.params;

    const adjustment = await StockAdjustment.findById(stock_adjustment_id).populate(
      'warehouse_id',
      'name code'
    );

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: 'Stock adjustment not found',
      });
    }

    const adjustmentItems = await StockAdjustmentItem.find({ stock_adjustment_id })
      .populate('product_id', 'name sku uom')
      .populate('location_id', 'name code');

    res.status(200).json({
      success: true,
      data: {
        adjustment,
        items: adjustmentItems,
      },
    });
  } catch (error) {
    console.error('Get adjustment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching adjustment details',
      error: error.message,
    });
  }
};

/**
 * Get all stock adjustments with pagination
 */
exports.getAllStockAdjustments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, reason } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (reason) {
      filter.reason = reason;
    }

    const adjustments = await StockAdjustment.find(filter)
      .populate('warehouse_id', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StockAdjustment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: adjustments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all stock adjustments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock adjustments',
      error: error.message,
    });
  }
};

/**
 * Get adjustment summary
 */
exports.getAdjustmentSummary = async (req, res) => {
  try {
    const { warehouse_id, reason, status } = req.query;

    const filter = {};
    if (warehouse_id) filter.warehouse_id = warehouse_id;
    if (reason) filter.reason = reason;
    if (status) filter.status = status;

    const adjustments = await StockAdjustment.find(filter);
    const total = adjustments.length;
    const done = adjustments.filter(a => a.status === DocumentStatus.DONE).length;
    const draft = adjustments.filter(a => a.status === DocumentStatus.DRAFT).length;

    res.status(200).json({
      success: true,
      data: {
        total,
        done,
        draft,
        adjustments,
      },
    });
  } catch (error) {
    console.error('Get adjustment summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching adjustment summary',
      error: error.message,
    });
  }
};