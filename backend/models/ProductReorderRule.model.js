import mongoose from 'mongoose';

const reorderRuleSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  location_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },

  min_quantity: { type: Number, required: true },
  max_quantity: { type: Number },
}, { timestamps: true });

export default mongoose.model('ProductReorderRule', reorderRuleSchema);
