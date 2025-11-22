const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },

  name: { type: String, required: true },
  code: { type: String, required: true },

  parent_location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null },

  is_active: { type: Boolean, default: true },
}, { timestamps: true });

locationSchema.index({ warehouse_id: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Location', locationSchema);
