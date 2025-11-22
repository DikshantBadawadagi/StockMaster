import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true, required: true },
  address: { type: String },
}, { timestamps: true });

export default mongoose.model('Warehouse', warehouseSchema);
