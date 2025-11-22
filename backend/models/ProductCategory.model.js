import mongoose from 'mongoose';

const productCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true },
  parent_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', default: null },
}, { timestamps: true });

export default mongoose.model('ProductCategory', productCategorySchema);
