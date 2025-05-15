const mongoose = require('mongoose');

const iPhoneSchema = new mongoose.Schema({
  modelName: String,
  releaseDate: String,
  display: {
    sizeInches: Number,
    type: String,
    resolution: String,
    refreshRate: String
  },
  processor: String,
  ramGB: Number,
  storageOptions: [String],
  battery: {
    capacitymAh: Number,
    lifeHours: Number,
    chargingSpeed: String
  },
  camera: {
    rear: String,
    front: String,
    lidar: String
  },
  os: String,
  buildMaterial: String,
  weightGrams: Number,
  waterResistance: String,
  priceUSD: Number,
  dimensions: String
});

module.exports = mongoose.model('Iphone', iPhoneSchema);
