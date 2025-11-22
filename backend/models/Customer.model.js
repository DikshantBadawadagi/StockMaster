import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },

  phone: String,
  email: String,
  address: String,
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);
