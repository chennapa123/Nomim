const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private (Buyer only)
router.post('/', [
  auth,
  authorize('buyer'),
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress').trim().notEmpty().withMessage('Shipping address is required'),
  body('contactPhone').trim().notEmpty().withMessage('Contact phone is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity, shippingAddress, contactPhone } = req.body;

    // Get product
    const product = await Product.findById(productId).populate('farmerId');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is available
    if (product.status !== 'available') {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Check if enough quantity
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    // Calculate total amount
    const totalAmount = product.price * quantity;

    // Create order
    const order = new Order({
      buyerId: req.user.userId,
      farmerId: product.farmerId._id,
      productId: product._id,
      quantity,
      totalAmount,
      shippingAddress,
      contactPhone
    });

    await order.save();

    // Update product quantity
    product.quantity -= quantity;
    if (product.quantity === 0) {
      product.status = 'sold';
    }
    await product.save();

    await order.populate('productId');
    await order.populate('buyerId', 'name email phone');
    await order.populate('farmerId', 'name email phone address location');

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get orders of logged-in user (buyer)
// @access  Private (Buyer only)
router.get('/my-orders', [
  auth,
  authorize('buyer')
], async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user.userId })
      .populate('productId')
      .populate('farmerId', 'name phone email address location')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/farmer/orders
// @desc    Get orders for logged-in farmer
// @access  Private (Farmer only)
router.get('/farmer/orders', [
  auth,
  authorize('farmer')
], async (req, res) => {
  try {
    const orders = await Order.find({ farmerId: req.user.userId })
      .populate('productId')
      .populate('buyerId', 'name email phone address location')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get farmer orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('productId')
      .populate('buyerId', 'name email phone address location')
      .populate('farmerId', 'name email phone address location');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    if (order.buyerId._id.toString() !== req.user.userId && 
        order.farmerId._id.toString() !== req.user.userId &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (delivery or payment)
// @access  Private (Farmer for delivery, Buyer/Admin for payment)
router.put('/:id/status', [
  auth
], async (req, res) => {
  try {
    const { deliveryStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    const isFarmer = order.farmerId.toString() === req.user.userId;
    const isBuyer = order.buyerId.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    if (deliveryStatus) {
      if (!isFarmer && !isAdmin) {
        return res.status(403).json({ message: 'Only farmer can update delivery status' });
      }
      order.deliveryStatus = deliveryStatus;
    }

    if (paymentStatus) {
      if (!isBuyer && !isAdmin) {
        return res.status(403).json({ message: 'Only buyer can update payment status' });
      }
      order.paymentStatus = paymentStatus;
    }

    await order.save();
    await order.populate('productId');
    await order.populate('buyerId', 'name email phone');
    await order.populate('farmerId', 'name email phone address location');

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

