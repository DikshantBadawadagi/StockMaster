const mongoose = require('mongoose');

const deliveryOrderSchema = new mongoose.Schema({
  document_number: { type: String, unique: true, required: true },

  status: {
    type: String,
    enum: ['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED'],
    default: 'DRAFT'
  },

  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },

  expected_ship_date: Date,
  shipped_date: Date,

  remarks: String,
}, { timestamps: true });

module.exports = mongoose.model('DeliveryOrder', deliveryOrderSchema);
