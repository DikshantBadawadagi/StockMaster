import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },

  sku: { type: String, unique: true, required: true, uppercase: true, trim: true },
  code: { type: String, unique: true, sparse: true, uppercase: true, trim: true },
  barcode: { type: String, trim: true },

  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', required: true },

  uom: { type: String, required: true, uppercase: true, trim: true },

  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    weight: { type: Number },
    dimension_unit: { type: String, enum: ['cm', 'inch', 'meter'], default: 'cm' },
    weight_unit: { type: String, enum: ['kg', 'lb', 'g'], default: 'kg' },
  },

  pricing: {
    cost_price: { type: Number, default: 0 },
    selling_price: { type: Number, default: 0 },
    currency: { type: String, default: 'USD', uppercase: true },
  },

  supplier_info: {
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    supplier_sku: { type: String, trim: true },
    lead_time_days: { type: Number },
  },

  inventory_settings: {
    min_stock_level: { type: Number, default: 0 },
    max_stock_level: { type: Number, default: 0 },
    reorder_point: { type: Number, default: 0 },
    reorder_quantity: { type: Number, default: 0 },
  },

  product_type: {
    type: String,
    enum: ['finished_goods', 'raw_material', 'semi_finished', 'consumable', 'service'],
    default: 'finished_goods'
  },

  is_serialized: { type: Boolean, default: false },
  is_batch_tracked: { type: Boolean, default: false },
  is_perishable: { type: Boolean, default: false },

  image_url: { type: String, trim: true },
  tags: [{ type: String, trim: true }],

  is_active: { type: Boolean, default: true },
  notes: { type: String, trim: true },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
