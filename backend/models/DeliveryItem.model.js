import mongoose from 'mongoose';

const deliveryItemSchema = new mongoose.Schema({
  delivery_order_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DeliveryOrder', 
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
  quantity_ordered: { 
    type: Number, 
    required: true 
  },
  quantity_shipped: { 
    type: Number, 
    default: 0 
  },
  remarks: String,
}, { timestamps: true });

deliveryItemSchema.index({ delivery_order_id: 1, product_id: 1 });

export default mongoose.model('DeliveryItem', deliveryItemSchema);