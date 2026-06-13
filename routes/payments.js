const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Note: Razorpay payment gateway functionality has been removed.
// Implement your own payment gateway integration here.
// The API endpoints (POST /api/payments/create-order and POST /api/payments/verify)
// should be implemented with your preferred payment gateway.

module.exports = router;
