import mongoose from 'mongoose';

const internalTransferItemSchema = new mongoose.Schema({
  internal_transfer_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'InternalTransfer', 
    required: true 
  },
  product_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  source_location_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Location', 
    required: true 
  },
  destination_location_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Location', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  quantity_transferred: { 
    type: Number, 
    default: 0 
  },
  remarks: String,
}, { timestamps: true });

internalTransferItemSchema.index({ internal_transfer_id: 1, product_id: 1 });

export default mongoose.model('InternalTransferItem', internalTransferItemSchema);