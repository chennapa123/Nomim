const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @GET /api/users/farmers - List all farmers
router.get('/farmers', async (req, res) => {
  try {
    const { state, cropType, farmingType, page = 1, limit = 12 } = req.query;
    const query = { role: 'farmer', isActive: true };
    if (state) query['farmLocation.state'] = new RegExp(state, 'i');
    if (farmingType) query.farmingType = farmingType;
    if (cropType) query.cropTypes = { $in: [new RegExp(cropType, 'i')] };
    const total = await User.countDocuments(query);
    const farmers = await User.find(query).select('-password').skip((page - 1) * limit).limit(Number(limit)).sort('-rating');
    res.json({ success: true, total, farmers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/users/:id - Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
