const Receipt = require('../models/Receipt.model.js');
const ReceiptItem = require('../models/ReceiptItem.model.js');
const Product = require('../models/Product.model.js');
const Location = require('../models/Location.model.js');
const { DocumentStatus } = require('../models/DocumentStatus.js');
const stockLedgerService = require('../services/stockLedger.service.js');

/**
 * Create a new receipt (DRAFT status)
 */
exports.createReceipt = async (req, res) => {
  try {
    const { document_number, supplier_id, warehouse_id, expected_date, remarks } = req.body;

    // Validation
    if (!document_number || !supplier_id || !warehouse_id) {
      return res.status(400).json({
        success: false,
        message: 'document_number, supplier_id, and warehouse_id are required',
      });
    }

    // Check if document_number already exists
    const existingReceipt = await Receipt.findOne({ document_number });
    if (existingReceipt) {
      return res.status(400).json({
        success: false,
        message: 'Receipt with this document_number already exists',
      });
    }

    // Create receipt
    const receipt = await Receipt.create({
      document_number,
      supplier_id,
      warehouse_id,
      expected_date,
      remarks,
      status: DocumentStatus.DRAFT,
    });

    res.status(201).json({
      success: true,
      message: 'Receipt created successfully in DRAFT status',
      data: receipt,
    });
  } catch (error) {
    console.error('Create receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating receipt',
      error: error.message,
    });
  }
};

/**
 * Add items to a receipt
 */
exports.addReceiptItem = async (req, res) => {
  try {
    const { receipt_id, product_id, location_id, quantity_ordered, remarks } = req.body;

    // Validation
    if (!receipt_id || !product_id || !location_id || !quantity_ordered) {
      return res.status(400).json({
        success: false,
        message: 'receipt_id, product_id, location_id, and quantity_ordered are required',
      });
    }

    if (quantity_ordered <= 0) {
      return res.status(400).json({
        success: false,
        message: 'quantity_ordered must be greater than 0',
      });
    }

    // Check if receipt exists and is in DRAFT status
    const receipt = await Receipt.findById(receipt_id);
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found',
      });
    }

    if (receipt.status !== DocumentStatus.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Can only add items to receipts in DRAFT status',
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

    // Check if location exists
    const location = await Location.findById(location_id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      });
    }

    // Check if item already exists in receipt
    const existingItem = await ReceiptItem.findOne({
      receipt_id,
      product_id,
      location_id,
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'This product already exists in this receipt at this location',
      });
    }

    // Create receipt item
    const receiptItem = await ReceiptItem.create({
      receipt_id,
      product_id,
      location_id,
      quantity_ordered,
      quantity_received: 0,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: 'Receipt item added successfully',
      data: receiptItem,
    });
  } catch (error) {
    console.error('Add receipt item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding receipt item',
      error: error.message,
    });
  }
};

/**
 * Validate receipt and add to stock
 */
exports.validateReceipt = async (req, res) => {
  try {
    const { receipt_id } = req.body;

    if (!receipt_id) {
      return res.status(400).json({
        success: false,
        message: 'receipt_id is required',
      });
    }

    // Check if receipt exists
    const receipt = await Receipt.findById(receipt_id);
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found',
      });
    }

    if (receipt.status !== DocumentStatus.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Only DRAFT receipts can be validated',
      });
    }

    // Get all items for this receipt
    const receiptItems = await ReceiptItem.find({ receipt_id }).populate(
      'product_id location_id'
    );

    if (receiptItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Receipt must have at least one item',
      });
    }

    // Validate all items and create ledger entries
    for (const item of receiptItems) {
      if (item.quantity_received <= 0) {
        return res.status(400).json({
          success: false,
          message: `Item ${item.product_id.name} has no quantity received`,
        });
      }

      // Create ledger entry for this item
      await stockLedgerService.createLedgerEntry({
        product_id: item.product_id._id,
        warehouse_id: receipt.warehouse_id,
        location_id: item.location_id._id,
        document_type: 'RECEIPT',
        document_id: receipt._id,
        document_line_id: item._id,
        movement_type: 'IN',
        quantity: item.quantity_received,
        created_by: req.user._id,
        note: `Receipt from supplier - ${receipt.document_number}`,
      });
    }

    // Update receipt status to DONE
    receipt.status = DocumentStatus.DONE;
    receipt.received_date = new Date();
    await receipt.save();

    res.status(200).json({
      success: true,
      message: 'Receipt validated successfully. Stock added and ledger entries created.',
      data: receipt,
    });
  } catch (error) {
    console.error('Validate receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating receipt',
      error: error.message,
    });
  }
};

/**
 * Get receipt details with items
 */
exports.getReceiptDetails = async (req, res) => {
  try {
    const { receipt_id } = req.params;

    const receipt = await Receipt.findById(receipt_id)
      .populate('supplier_id', 'name contact_email')
      .populate('warehouse_id', 'name code');

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found',
      });
    }

    const receiptItems = await ReceiptItem.find({ receipt_id })
      .populate('product_id', 'name sku uom')
      .populate('location_id', 'name code');

    res.status(200).json({
      success: true,
      data: {
        receipt,
        items: receiptItems,
      },
    });
  } catch (error) {
    console.error('Get receipt details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching receipt details',
      error: error.message,
    });
  }
};

/**
 * Get all receipts with pagination
 */
exports.getAllReceipts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const receipts = await Receipt.find(filter)
      .populate('supplier_id', 'name')
      .populate('warehouse_id', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Receipt.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: receipts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all receipts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching receipts',
      error: error.message,
    });
  }
};