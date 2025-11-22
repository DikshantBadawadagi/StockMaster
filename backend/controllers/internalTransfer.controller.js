const InternalTransfer = require('../models/InternalTransfer.model');
const InternalTransferItem = require('../models/InternalTransferItem.model');
const Product = require('../models/Product.model');
const Location = require('../models/Location.model');
const Warehouse = require('../models/Warehouse.model');
const { DocumentStatus } = require('../models/DocumentStatus');
const stockLedgerService = require('../services/stockLedger.service');

/**
 * Create a new internal transfer (DRAFT status)
 */
exports.createInternalTransfer = async (req, res) => {
  try {
    const { document_number, source_warehouse_id, destination_warehouse_id, remarks } = req.body;

    // Validation
    if (!document_number || !source_warehouse_id || !destination_warehouse_id) {
      return res.status(400).json({
        success: false,
        message: 'document_number, source_warehouse_id, and destination_warehouse_id are required',
      });
    }

    // Check if source and destination are different
    if (source_warehouse_id === destination_warehouse_id) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination warehouses must be different',
      });
    }

    // Check if document_number already exists
    const existingTransfer = await InternalTransfer.findOne({ document_number });
    if (existingTransfer) {
      return res.status(400).json({
        success: false,
        message: 'Internal transfer with this document_number already exists',
      });
    }

    // Check if both warehouses exist
    const sourceWarehouse = await Warehouse.findById(source_warehouse_id);
    if (!sourceWarehouse) {
      return res.status(404).json({
        success: false,
        message: 'Source warehouse not found',
      });
    }

    const destinationWarehouse = await Warehouse.findById(destination_warehouse_id);
    if (!destinationWarehouse) {
      return res.status(404).json({
        success: false,
        message: 'Destination warehouse not found',
      });
    }

    // Create internal transfer
    const transfer = await InternalTransfer.create({
      document_number,
      source_warehouse_id,
      destination_warehouse_id,
      remarks,
      status: DocumentStatus.DRAFT,
    });

    res.status(201).json({
      success: true,
      message: 'Internal transfer created successfully in DRAFT status',
      data: transfer,
    });
  } catch (error) {
    console.error('Create internal transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating internal transfer',
      error: error.message,
    });
  }
};

/**
 * Add items to an internal transfer
 */
exports.addTransferItem = async (req, res) => {
  try {
    const {
      internal_transfer_id,
      product_id,
      source_location_id,
      destination_location_id,
      quantity,
      remarks,
    } = req.body;

    // Validation
    if (!internal_transfer_id || !product_id || !source_location_id || !destination_location_id || !quantity) {
      return res.status(400).json({
        success: false,
        message:
          'internal_transfer_id, product_id, source_location_id, destination_location_id, and quantity are required',
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'quantity must be greater than 0',
      });
    }

    // Check if source and destination locations are different
    if (source_location_id === destination_location_id) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination locations must be different',
      });
    }

    // Check if transfer exists and is in DRAFT status
    const transfer = await InternalTransfer.findById(internal_transfer_id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Internal transfer not found',
      });
    }

    if (transfer.status !== DocumentStatus.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Can only add items to transfers in DRAFT status',
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

    // Check if source location exists and belongs to source warehouse
    const sourceLocation = await Location.findById(source_location_id);
    if (!sourceLocation) {
      return res.status(404).json({
        success: false,
        message: 'Source location not found',
      });
    }

    if (sourceLocation.warehouse_id.toString() !== transfer.source_warehouse_id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Source location does not belong to source warehouse',
      });
    }

    // Check if destination location exists and belongs to destination warehouse
    const destinationLocation = await Location.findById(destination_location_id);
    if (!destinationLocation) {
      return res.status(404).json({
        success: false,
        message: 'Destination location not found',
      });
    }

    if (destinationLocation.warehouse_id.toString() !== transfer.destination_warehouse_id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Destination location does not belong to destination warehouse',
      });
    }

    // Check stock availability at source location
    const currentStock = await stockLedgerService.getStockBalance(
      product_id,
      transfer.source_warehouse_id,
      source_location_id
    );

    if (currentStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock at source location. Available: ${currentStock}, Requested: ${quantity}`,
      });
    }

    // Check if item already exists in transfer
    const existingItem = await InternalTransferItem.findOne({
      internal_transfer_id,
      product_id,
      source_location_id,
      destination_location_id,
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'This product transfer between these locations already exists in this transfer',
      });
    }

    // Create transfer item
    const transferItem = await InternalTransferItem.create({
      internal_transfer_id,
      product_id,
      source_location_id,
      destination_location_id,
      quantity,
      quantity_transferred: 0,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: 'Transfer item added successfully',
      data: transferItem,
    });
  } catch (error) {
    console.error('Add transfer item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding transfer item',
      error: error.message,
    });
  }
};

/**
 * Validate internal transfer and create dual ledger entries
 */
exports.validateInternalTransfer = async (req, res) => {
  try {
    const { internal_transfer_id } = req.body;

    if (!internal_transfer_id) {
      return res.status(400).json({
        success: false,
        message: 'internal_transfer_id is required',
      });
    }

    // Check if transfer exists
    const transfer = await InternalTransfer.findById(internal_transfer_id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Internal transfer not found',
      });
    }

    if (transfer.status !== DocumentStatus.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Only DRAFT transfers can be validated',
      });
    }

    // Get all items for this transfer
    const transferItems = await InternalTransferItem.find({ internal_transfer_id }).populate(
      'product_id source_location_id destination_location_id'
    );

    if (transferItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Transfer must have at least one item',
      });
    }

    // Validate all items and check stock availability
    for (const item of transferItems) {
      if (item.quantity_transferred <= 0) {
        return res.status(400).json({
          success: false,
          message: `Item ${item.product_id.name} has no quantity transferred`,
        });
      }

      // Final stock check at source
      const sourceStock = await stockLedgerService.getStockBalance(
        item.product_id._id,
        transfer.source_warehouse_id,
        item.source_location_id._id
      );

      if (sourceStock < item.quantity_transferred) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product_id.name} at source. Available: ${sourceStock}, Requested: ${item.quantity_transferred}`,
        });
      }
    }

    // Create dual ledger entries for each item
    for (const item of transferItems) {
      // Ledger Entry 1: TRANSFER_OUT from source location
      await stockLedgerService.createLedgerEntry({
        product_id: item.product_id._id,
        warehouse_id: transfer.source_warehouse_id,
        location_id: item.source_location_id._id,
        document_type: 'INTERNAL_TRANSFER',
        document_id: transfer._id,
        document_line_id: item._id,
        movement_type: 'TRANSFER_OUT',
        quantity: item.quantity_transferred,
        created_by: req.user._id,
        note: `Internal transfer from ${item.source_location_id.name} to ${item.destination_location_id.name} - ${transfer.document_number}`,
      });

      // Ledger Entry 2: TRANSFER_IN to destination location
      await stockLedgerService.createLedgerEntry({
        product_id: item.product_id._id,
        warehouse_id: transfer.destination_warehouse_id,
        location_id: item.destination_location_id._id,
        document_type: 'INTERNAL_TRANSFER',
        document_id: transfer._id,
        document_line_id: item._id,
        movement_type: 'TRANSFER_IN',
        quantity: item.quantity_transferred,
        created_by: req.user._id,
        note: `Internal transfer from ${item.source_location_id.name} to ${item.destination_location_id.name} - ${transfer.document_number}`,
      });
    }

    // Update transfer status to DONE
    transfer.status = DocumentStatus.DONE;
    await transfer.save();

    res.status(200).json({
      success: true,
      message: 'Internal transfer validated successfully. Dual ledger entries created.',
      data: transfer,
    });
  } catch (error) {
    console.error('Validate internal transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating internal transfer',
      error: error.message,
    });
  }
};

/**
 * Get internal transfer details with items
 */
exports.getTransferDetails = async (req, res) => {
  try {
    const { internal_transfer_id } = req.params;

    const transfer = await InternalTransfer.findById(internal_transfer_id)
      .populate('source_warehouse_id', 'name code')
      .populate('destination_warehouse_id', 'name code');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Internal transfer not found',
      });
    }

    const transferItems = await InternalTransferItem.find({ internal_transfer_id })
      .populate('product_id', 'name sku uom')
      .populate('source_location_id', 'name code')
      .populate('destination_location_id', 'name code');

    res.status(200).json({
      success: true,
      data: {
        transfer,
        items: transferItems,
      },
    });
  } catch (error) {
    console.error('Get transfer details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transfer details',
      error: error.message,
    });
  }
};

/**
 * Get all internal transfers with pagination
 */
exports.getAllInternalTransfers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const transfers = await InternalTransfer.find(filter)
      .populate('source_warehouse_id', 'name code')
      .populate('destination_warehouse_id', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InternalTransfer.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: transfers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all internal transfers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching internal transfers',
      error: error.message,
    });
  }
};