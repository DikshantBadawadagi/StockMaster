const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },

  phone: String,
  email: String,
  address: String,
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
