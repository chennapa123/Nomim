const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  imageURL: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'sold'],
    default: 'available'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

