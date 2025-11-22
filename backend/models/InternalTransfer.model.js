import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema({
  document_number: { type: String, unique: true, required: true },

  status: {
    type: String,
    enum: ['DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELED'],
    default: 'DRAFT'
  },

  source_warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  destination_warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },

  remarks: String,
}, { timestamps: true });

export default mongoose.model('InternalTransfer', transferSchema);
