// reviews.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { revieweeId, productId, orderId, rating, comment, type } = req.body;
    const review = await Review.create({ reviewer: req.user._id, reviewee: revieweeId, product: productId, order: orderId, rating, comment, type });

    if (type === 'product' && productId) {
      const reviews = await Review.find({ product: productId });
      const avgRating = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(productId, { rating: avgRating, totalRatings: reviews.length });
    } else if (revieweeId) {
      const reviews = await Review.find({ reviewee: revieweeId });
      const avgRating = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
      await User.findByIdAndUpdate(revieweeId, { rating: avgRating, totalRatings: reviews.length });
    }
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, type: 'product' }).populate('reviewer', 'name avatar role').sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId }).populate('reviewer', 'name avatar role').sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
