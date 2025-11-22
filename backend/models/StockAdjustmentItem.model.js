import mongoose from 'mongoose';

const stockAdjustmentItemSchema = new mongoose.Schema({
  stock_adjustment_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StockAdjustment', 
    required: true 
  },
  product_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  location_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Location', 
    required: true 
  },
  quantity_change: { 
    type: Number, 
    required: true 
  },
  remarks: String,
}, { timestamps: true });

stockAdjustmentItemSchema.index({ stock_adjustment_id: 1, product_id: 1 });

export default mongoose.model('StockAdjustmentItem', stockAdjustmentItemSchema);