const mongoose = require('mongoose');

const stockLedgerSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },

  document_type: {
    type: String,
    enum: ['RECEIPT', 'DELIVERY', 'INTERNAL_TRANSFER', 'ADJUSTMENT'],
    required: true
  },

  document_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  document_line_id: { type: mongoose.Schema.Types.ObjectId, required: true },

  movement_type: {
    type: String,
    enum: ['IN', 'OUT', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT_POS', 'ADJUSTMENT_NEG'],
    required: true
  },

  quantity: { type: Number, required: true },

  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  note: String,
}, { timestamps: true });

module.exports = mongoose.model('StockLedgerEntry', stockLedgerSchema);
