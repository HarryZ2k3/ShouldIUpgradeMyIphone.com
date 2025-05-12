const express = require('express');
const router = express.Router();
const Iphone = require('../models/Iphone');
router.get('/', async (req, res) => {
  try {
    const allModels = await Iphone.find();
    res.json(allModels);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch iPhone list' });
  }
});
// GET /api/iphones/:name
router.get('/:name', async (req, res) => {
  try {
    const modelName = decodeURIComponent(req.params.name).toLowerCase();

    const model = await Iphone.findOne({
      $expr: {
        $eq: [
          { $toLower: "$Model Name" },
          modelName
        ]
      }
    });

    if (!model) return res.status(404).json({ error: 'Model not found' });
    res.json(model);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch model data' });
  }
});


module.exports = router;
