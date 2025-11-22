const DeliveryOrder = require('../models/DeliveryOrder.model');
const DeliveryItem = require('../models/DeliveryItem.model');
const Product = require('../models/Product.model');
const Location = require('../models/Location.model');
const InventoryBalance = require('../models/InventoryBalance.model');
const { DocumentStatus } = require('../models/DocumentStatus');
const stockLedgerService = require('../services/stockLedger.service');

/**
 * Create a new delivery order (DRAFT status)
 */
exports.createDeliveryOrder = async (req, res) => {
  try {
    const { document_number, customer_id, warehouse_id, expected_ship_date, remarks } = req.body;

    // Validation
    if (!document_number || !warehouse_id) {
      return res.status(400).json({
        success: false,
        message: 'document_number and warehouse_id are required',
      });
    }

    // Check if document_number already exists
    const existingDelivery = await DeliveryOrder.findOne({ document_number });
    if (existingDelivery) {
      return res.status(400).json({
        success: false,
        message: 'Delivery order with this document_number already exists',
      });
    }

    // Create delivery order
    const deliveryOrder = await DeliveryOrder.create({
      document_number,
      customer_id,
      warehouse_id,
      expected_ship_date,
      remarks,
      status: DocumentStatus.DRAFT,
    });

    res.status(201).json({
      success: true,
      message: 'Delivery order created successfully in DRAFT status',
      data: deliveryOrder,
    });
  } catch (error) {
    console.error('Create delivery order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating delivery order',
      error: error.message,
    });
  }
};

/**
 * Add items to a delivery order
 */
exports.addDeliveryItem = async (req, res) => {
  try {
    const { delivery_order_id, product_id, location_id, quantity_ordered, remarks } = req.body;

    // Validation
    if (!delivery_order_id || !product_id || !location_id || !quantity_ordered) {
      return res.status(400).json({
        success: false,
        message: 'delivery_order_id, product_id, location_id, and quantity_ordered are required',
      });
    }

    if (quantity_ordered <= 0) {
      return res.status(400).json({
        success: false,
        message: 'quantity_ordered must be greater than 0',
      });
    }

    // Check if delivery order exists and is in DRAFT status
    const deliveryOrder = await DeliveryOrder.findById(delivery_order_id);
    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found',
      });
    }

    if (deliveryOrder.status !== DocumentStatus.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Can only add items to delivery orders in DRAFT status',
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

    // Check current stock availability
    const currentStock = await stockLedgerService.getStockBalance(
      product_id,
      deliveryOrder.warehouse_id,
      location_id
    );

    if (currentStock < quantity_ordered) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${currentStock}, Requested: ${quantity_ordered}`,
      });
    }

    // Check if item already exists in delivery order
    const existingItem = await DeliveryItem.findOne({
      delivery_order_id,
      product_id,
      location_id,
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'This product already exists in this delivery order at this location',
      });
    }

    // Create delivery item
    const deliveryItem = await DeliveryItem.create({
      delivery_order_id,
      product_id,
      location_id,
      quantity_ordered,
      quantity_shipped: 0,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: 'Delivery item added successfully',
      data: deliveryItem,
    });
  } catch (error) {
    console.error('Add delivery item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding delivery item',
      error: error.message,
    });
  }
};

/**
 * Validate delivery order and reduce stock
 */
exports.validateDeliveryOrder = async (req, res) => {
  try {
    const { delivery_order_id } = req.body;

    if (!delivery_order_id) {
      return res.status(400).json({
        success: false,
        message: 'delivery_order_id is required',
      });
    }

    // Check if delivery order exists
    const deliveryOrder = await DeliveryOrder.findById(delivery_order_id);
    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found',
      });
    }

    if (deliveryOrder.status !== DocumentStatus.DRAFT) {
      return res.status(400).json({
        success: false,
        message: 'Only DRAFT delivery orders can be validated',
      });
    }

    // Get all items for this delivery order
    const deliveryItems = await DeliveryItem.find({ delivery_order_id }).populate(
      'product_id location_id'
    );

    if (deliveryItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Delivery order must have at least one item',
      });
    }

    // Validate all items and check stock availability
    for (const item of deliveryItems) {
      if (item.quantity_shipped <= 0) {
        return res.status(400).json({
          success: false,
          message: `Item ${item.product_id.name} has no quantity shipped`,
        });
      }

      // Final stock check
      const currentStock = await stockLedgerService.getStockBalance(
        item.product_id._id,
        deliveryOrder.warehouse_id,
        item.location_id._id
      );

      if (currentStock < item.quantity_shipped) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product_id.name}. Available: ${currentStock}, Requested: ${item.quantity_shipped}`,
        });
      }
    }

    // Create ledger entries and reduce stock
    for (const item of deliveryItems) {
      await stockLedgerService.createLedgerEntry({
        product_id: item.product_id._id,
        warehouse_id: deliveryOrder.warehouse_id,
        location_id: item.location_id._id,
        document_type: 'DELIVERY',
        document_id: deliveryOrder._id,
        document_line_id: item._id,
        movement_type: 'OUT',
        quantity: item.quantity_shipped,
        created_by: req.user._id,
        note: `Delivery to customer - ${deliveryOrder.document_number}`,
      });
    }

    // Update delivery order status to DONE
    deliveryOrder.status = DocumentStatus.DONE;
    deliveryOrder.shipped_date = new Date();
    await deliveryOrder.save();

    res.status(200).json({
      success: true,
      message: 'Delivery order validated successfully. Stock reduced and ledger entries created.',
      data: deliveryOrder,
    });
  } catch (error) {
    console.error('Validate delivery order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating delivery order',
      error: error.message,
    });
  }
};

/**
 * Get delivery order details with items
 */
exports.getDeliveryOrderDetails = async (req, res) => {
  try {
    const { delivery_order_id } = req.params;

    const deliveryOrder = await DeliveryOrder.findById(delivery_order_id)
      .populate('customer_id', 'name contact_email')
      .populate('warehouse_id', 'name code');

    if (!deliveryOrder) {
      return res.status(404).json({
        success: false,
        message: 'Delivery order not found',
      });
    }

    const deliveryItems = await DeliveryItem.find({ delivery_order_id: delivery_order_id })
      .populate('product_id', 'name sku uom')
      .populate('location_id', 'name code');

    res.status(200).json({
      success: true,
      data: {
        deliveryOrder,
        items: deliveryItems,
      },
    });
  } catch (error) {
    console.error('Get delivery order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery order details',
      error: error.message,
    });
  }
};

/**
 * Get all delivery orders with pagination
 */
exports.getAllDeliveryOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const deliveryOrders = await DeliveryOrder.find(filter)
      .populate('customer_id', 'name')
      .populate('warehouse_id', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DeliveryOrder.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: deliveryOrders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all delivery orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery orders',
      error: error.message,
    });
  }
};