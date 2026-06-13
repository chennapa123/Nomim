const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/farmers
// @desc    Get all farmers
// @access  Public
router.get('/farmers', async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' })
      .select('-password')
      .sort({ name: 1 });

    res.json(farmers);
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (own profile or admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check authorization
    if (user._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, phone, address, location } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (location) user.location = location;

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;

    res.json(userObj);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/users/:id/verify
// @desc    Verify farmer account (Admin only)
// @access  Private (Admin only)
router.put('/:id/verify', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.json(userObj);
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

