// models/Iphone.js
const mongoose = require('mongoose');

const iphoneSchema = new mongoose.Schema({
  name: String,
  releaseYear: Number,
  display: String,
  processor: String,
  ram: String,
  battery: String,
  camera: String,
  os: String,
  price: String
});

module.exports = mongoose.model('Iphone', iphoneSchema);
