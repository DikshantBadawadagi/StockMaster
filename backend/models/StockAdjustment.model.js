const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema({
  document_number: { type: String, unique: true, required: true },

  status: {
    type: String,
    enum: ['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED'],
    default: 'DRAFT'
  },

  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },

  reason: {
    type: String,
    enum: ['DAMAGED', 'LOSS', 'COUNT_CORRECTION', 'OTHER'],
    required: true
  },

  adjustment_date: Date,
  remarks: String,
}, { timestamps: true });

module.exports = mongoose.model('StockAdjustment', adjustmentSchema);
