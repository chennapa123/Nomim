const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products (with optional filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, status, district, state, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let products = await Product.find(query)
      .populate('farmerId', 'name phone address location')
      .sort({ createdAt: -1 });

    // Filter by location if provided
    if (district || state) {
      products = products.filter(product => {
        if (!product.farmerId || !product.farmerId.location) return false;
        const loc = product.farmerId.location;
        if (district && loc.district && !loc.district.toLowerCase().includes(district.toLowerCase())) {
          return false;
        }
        if (state && loc.state && !loc.state.toLowerCase().includes(state.toLowerCase())) {
          return false;
        }
        return true;
      });
    }

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmerId', 'name phone email address location');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Farmer only)
router.post('/', [
  auth,
  authorize('farmer'),
  body('productName').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productName, category, price, quantity, imageURL, description } = req.body;

    const product = new Product({
      farmerId: req.user.userId,
      productName,
      category,
      price,
      quantity,
      imageURL: imageURL || '',
      description: description || ''
    });

    await product.save();
    await product.populate('farmerId', 'name phone address location');

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Farmer only - owner)
router.put('/:id', [
  auth,
  authorize('farmer')
], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns the product
    if (product.farmerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const { productName, category, price, quantity, imageURL, description, status } = req.body;

    if (productName) product.productName = productName;
    if (category) product.category = category;
    if (price !== undefined) product.price = price;
    if (quantity !== undefined) product.quantity = quantity;
    if (imageURL !== undefined) product.imageURL = imageURL;
    if (description !== undefined) product.description = description;
    if (status) product.status = status;

    await product.save();
    await product.populate('farmerId', 'name phone address location');

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Farmer only - owner)
router.delete('/:id', [
  auth,
  authorize('farmer')
], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns the product
    if (product.farmerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/products/farmer/my-products
// @desc    Get all products of logged-in farmer
// @access  Private (Farmer only)
router.get('/farmer/my-products', [
  auth,
  authorize('farmer')
], async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.user.userId })
      .populate('farmerId', 'name phone address location')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Get farmer products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

