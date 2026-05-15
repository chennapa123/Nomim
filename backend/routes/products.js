const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/products - Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, isOrganic, minPrice, maxPrice, state, search, sort, page = 1, limit = 12, farmer } = req.query;
    const query = { isAvailable: true };
    if (category) query.category = category;
    if (isOrganic) query.isOrganic = isOrganic === 'true';
    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
    if (state) query['location.state'] = new RegExp(state, 'i');
    if (farmer) query.farmer = farmer;
    if (search) query.$text = { $search: search };

    const sortOptions = { newest: '-createdAt', oldest: 'createdAt', 'price-low': 'price', 'price-high': '-price', rating: '-rating' };
    const sortBy = sortOptions[sort] || '-createdAt';

    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortBy).skip((page - 1) * limit).limit(Number(limit)).populate('farmer', 'name farmName farmLocation avatar rating');

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/products/featured
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isAvailable: true }).limit(8).populate('farmer', 'name farmName avatar');
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmer', 'name farmName farmLocation avatar rating bio phone joinedAt farmingType');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/products - Create product (farmer only)
router.post('/', protect, authorize('farmer'), async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, farmer: req.user._id });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/products/:id
router.put('/:id', protect, authorize('farmer'), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, farmer: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
    Object.assign(product, req.body);
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/products/:id
router.delete('/:id', protect, authorize('farmer'), async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, farmer: req.user._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
