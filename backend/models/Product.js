const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['vegetables', 'fruits', 'grains', 'pulses', 'spices', 'dairy', 'poultry', 'herbs', 'flowers', 'other']
  },
  images: [{ url: String, public_id: String }],
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, enum: ['kg', 'quintal', 'ton', 'dozen', 'piece', 'liter', 'bundle'] },
  minOrderQuantity: { type: Number, default: 1 },
  maxOrderQuantity: { type: Number },
  availableQuantity: { type: Number, required: true, min: 0 },
  harvestDate: { type: Date },
  expiryDate: { type: Date },
  isOrganic: { type: Boolean, default: false },
  organicCertification: { type: String },
  location: {
    city: String,
    state: String,
    pincode: String
  },
  tags: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  deliveryOptions: {
    farmerDelivery: { type: Boolean, default: false },
    vendorPickup: { type: Boolean, default: true },
    shippingAvailable: { type: Boolean, default: false }
  }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ farmer: 1 });

module.exports = mongoose.model('Product', productSchema);
