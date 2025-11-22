const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },

  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },

  parent_location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null },

  location_type: {
    type: String,
    enum: ['zone', 'aisle', 'rack', 'shelf', 'bin', 'pallet', 'floor', 'custom'],
    default: 'rack'
  },

  capacity: {
    max_weight: { type: Number }, // in kg
    max_volume: { type: Number }, // in cubic meters
    max_pallets: { type: Number },
  },

  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    unit: { type: String, enum: ['cm', 'inch', 'meter'], default: 'cm' },
  },

  aisle_number: { type: String, trim: true },
  level: { type: Number }, // floor level or shelf level

  temperature_controlled: { type: Boolean, default: false },
  temperature_range: {
    min: { type: Number },
    max: { type: Number },
    unit: { type: String, enum: ['celsius', 'fahrenheit'], default: 'celsius' },
  },

  access_restrictions: {
    requires_clearance: { type: Boolean, default: false },
    clearance_level: { type: String, trim: true },
  },

  barcode: { type: String, trim: true },
  qr_code: { type: String, trim: true },

  is_pickable: { type: Boolean, default: true },
  is_receivable: { type: Boolean, default: true },

  is_active: { type: Boolean, default: true },
  notes: { type: String, trim: true },
}, { timestamps: true });

locationSchema.index({ warehouse_id: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Location', locationSchema);
