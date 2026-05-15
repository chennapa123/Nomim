const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['farmer', 'vendor', 'admin'], required: true },
  phone: { type: String, trim: true },
  avatar: { type: String, default: '' },

  // Farmer specific
  farmName: { type: String },
  farmLocation: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: { lat: Number, lng: Number }
  },
  farmSize: { type: String },
  cropTypes: [{ type: String }],
  farmingType: { type: String, enum: ['organic', 'conventional', 'mixed'], default: 'conventional' },

  // Vendor specific
  businessName: { type: String },
  businessType: { type: String, enum: ['retailer', 'wholesaler', 'restaurant', 'exporter', 'other'] },
  businessLocation: {
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  gstNumber: { type: String },

  // Common
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  bio: { type: String, maxlength: 500 },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
