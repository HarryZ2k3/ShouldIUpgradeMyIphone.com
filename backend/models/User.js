const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  googleId: String,
  currentModel: String,
  avatarUrl: String,
  favorites: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('User', userSchema);
