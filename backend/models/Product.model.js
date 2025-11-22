const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },

  sku: { type: String, unique: true, required: true },
  code: { type: String, unique: true, sparse: true },

  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', required: true },

  uom: { type: String, required: true },

  is_active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
