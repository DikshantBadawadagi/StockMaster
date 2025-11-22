import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },

  phone: String,
  email: String,
  address: String,
}, { timestamps: true });

export default mongoose.model('Supplier', supplierSchema);
