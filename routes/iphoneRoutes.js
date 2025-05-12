const express = require('express');
const router = express.Router();
const Iphone = require('../models/Iphone');

// GET /api/iphones/all
router.get('/all', async (req, res) => {
  try {
    const data = await Iphone.find(); // return all fields
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch iPhone data' });
  }
});

module.exports = router;
