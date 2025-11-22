import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
  document_number: { type: String, unique: true, required: true },

  status: {
    type: String,
    enum: ['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED'],
    default: 'DRAFT'
  },

  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },

  expected_date: Date,
  received_date: Date,

  remarks: String,
}, { timestamps: true });

export default mongoose.model('Receipt', receiptSchema);
