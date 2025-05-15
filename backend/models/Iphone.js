const mongoose = require('mongoose');

const iPhoneSchema = new mongoose.Schema({}, { strict: false }); // Use strict:false to accept all CSV fields

module.exports = mongoose.model('iPhone', iPhoneSchema);
