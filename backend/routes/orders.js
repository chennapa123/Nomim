const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/orders - Get orders for current user
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = req.user.role === 'farmer' ? { farmer: req.user._id } : { vendor: req.user._id };
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort('-createdAt').skip((page - 1) * limit).limit(Number(limit))
      .populate('vendor', 'name businessName avatar phone')
      .populate('farmer', 'name farmName avatar phone')
      .populate('items.product', 'name images unit');

    res.json({ success: true, total, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('vendor', 'name businessName email phone businessLocation avatar')
      .populate('farmer', 'name farmName email phone farmLocation avatar')
      .populate('items.product', 'name images unit category');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.vendor._id.toString() !== req.user._id.toString() && order.farmer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/orders - Place an order (vendor)
router.post('/', protect, authorize('vendor'), async (req, res) => {
  try {
    const { items, farmerId, deliveryType, deliveryAddress, paymentMethod, vendorNotes } = req.body;

    // Validate and compute totals
    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isAvailable) return res.status(400).json({ success: false, message: `Product ${item.productId} not available` });
      if (item.quantity > product.availableQuantity) return res.status(400).json({ success: false, message: `Insufficient quantity for ${product.name}` });
      orderItems.push({ product: product._id, quantity: item.quantity, priceAtOrder: product.price, unit: product.unit });
      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      vendor: req.user._id, farmer: farmerId, items: orderItems, totalAmount,
      deliveryType, deliveryAddress, paymentMethod, vendorNotes,
      statusHistory: [{ status: 'pending', note: 'Order placed by vendor' }]
    });

    // Notify farmer
    await Notification.create({
      user: farmerId,
      title: 'New Order Received!',
      message: `You have a new order from ${req.user.businessName || req.user.name}`,
      type: 'order',
      link: `/orders/${order._id}`,
      data: { orderId: order._id }
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/orders/:id/status - Update order status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Farmers can accept/reject/process/ready/dispatch; vendors can cancel; both can see
    const farmerAllowed = ['accepted', 'rejected', 'processing', 'ready', 'dispatched', 'delivered'];
    const vendorAllowed = ['cancelled'];

    if (req.user.role === 'farmer' && !farmerAllowed.includes(status)) {
      return res.status(403).json({ success: false, message: 'Farmers cannot set this status' });
    }
    if (req.user.role === 'vendor' && !vendorAllowed.includes(status)) {
      return res.status(403).json({ success: false, message: 'Vendors cannot set this status' });
    }

    // Validate: Payment must be completed before marking as delivered (except COD which will auto-complete)
    if (status === 'delivered' && order.paymentStatus === 'pending' && order.paymentMethod !== 'cod') {
      return res.status(400).json({ success: false, message: 'Cannot mark as delivered. Payment must be completed first.' });
    }

    order.status = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
    if (status === 'delivered') {
      order.actualDeliveryDate = new Date();
      // Automatically mark COD payment as paid when delivered
      if (order.paymentMethod === 'cod') {
        order.paymentStatus = 'paid';
      }
    }
    await order.save();

    // Notify the other party
    const notifyUser = req.user.role === 'farmer' ? order.vendor : order.farmer;
    await Notification.create({
      user: notifyUser,
      title: `Order ${order.orderNumber} Updated`,
      message: `Order status changed to: ${status}`,
      type: 'order',
      link: `/orders/${order._id}`
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/orders/:id/payment-status - Update payment status
router.put('/:id/payment-status', protect, async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Only vendor (seller) can mark payment as received
    if (order.vendor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the seller can update payment status' });
    }

    // Only allow paid or failed status
    if (!['paid', 'failed', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    // Notify farmer
    await Notification.create({
      user: order.farmer,
      title: `Payment ${paymentStatus}`,
      message: `Payment for order ${order.orderNumber} has been marked as ${paymentStatus}`,
      type: 'payment',
      link: `/orders/${order._id}`
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/orders/stats/dashboard
router.get('/stats/dashboard', protect, async (req, res) => {
  try {
    const matchField = req.user.role === 'farmer' ? 'farmer' : 'vendor';
    const stats = await Order.aggregate([
      { $match: { [matchField]: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = await Order.aggregate([
      { $match: { [matchField]: req.user._id, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    res.json({ success: true, stats, totalRevenue: totalRevenue[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
