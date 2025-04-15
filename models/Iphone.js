const mongoose = require('mongoose');

const iphoneSchema = new mongoose.Schema({
  name: String,
  specs: Object
});

module.exports = mongoose.model('Iphone', iphoneSchema);
