const express = require('express');
const router = express.Router();
const Iphone = require('../models/Iphone');

// GET /api/iphones/:name
router.get('/:name', async (req, res) => {
  try {
    const model = await Iphone.findOne({ "Model Name": new RegExp(`^${req.params.name}$`, 'i') });
    if (!model) return res.status(404).json({ error: 'Model not found' });
    res.json(model);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch model data' });
  }
});

module.exports = router;
