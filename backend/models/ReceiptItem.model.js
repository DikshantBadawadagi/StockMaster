const mongoose = require('mongoose');

const receiptItemSchema = new mongoose.Schema({
  receipt_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Receipt', 
    required: true 
  },
  product_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  location_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Location', 
    required: true 
  },
  quantity_ordered: { 
    type: Number, 
    required: true 
  },
  quantity_received: { 
    type: Number, 
    default: 0 
  },
  remarks: String,
}, { timestamps: true });

receiptItemSchema.index({ receipt_id: 1, product_id: 1 });

module.exports = mongoose.model('ReceiptItem', receiptItemSchema);