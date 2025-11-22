const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, unique: true, required: true, uppercase: true, trim: true },

  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    postal_code: { type: String, trim: true },
  },

  contact: {
    phone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    manager_name: { type: String, trim: true },
  },

  capacity: {
    total_area: { type: Number }, // in square meters
    usable_area: { type: Number },
  },

  warehouse_type: {
    type: String,
    enum: ['distribution', 'fulfillment', 'cold_storage', 'general', 'custom'],
    default: 'general'
  },

  is_active: { type: Boolean, default: true },
  notes: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);
