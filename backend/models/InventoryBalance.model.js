const mongoose = require('mongoose');

const inventoryBalanceSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },

  quantity_on_hand: { type: Number, required: true, default: 0 },
}, { timestamps: true });

inventoryBalanceSchema.index({ product_id: 1, location_id: 1 }, { unique: true });

module.exports = mongoose.model('InventoryBalance', inventoryBalanceSchema);
