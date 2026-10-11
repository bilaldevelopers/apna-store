import mongoose from 'mongoose';
const s = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, unique: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  description: { type: String, default: '', maxlength: 4000 },
  sellingPrice: { type: Number, required: true, min: 0 },
  purchaseCost: { type: Number, min: 0, select: false },
  category: { type: String, default: 'Blankets', trim: true, index: true },
  images: [{ _id: false, url: { type: String, required: true }, publicId: { type: String, required: true } }],
  variants: [{ _id: false, name: String, values: [String] }],
  specs: [{ _id: false, label: String, value: String }],
  stockQuantity: { type: Number, min: 0, default: 0 },
  isActive: { type: Boolean, default: true, index: true },
  availabilityStatus: { type: String, enum: ['in_stock', 'out_of_stock'], default: 'in_stock' },
}, { timestamps: true });
export default mongoose.model('Product', s);
