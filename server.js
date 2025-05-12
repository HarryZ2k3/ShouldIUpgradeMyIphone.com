// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const Iphone = require('./models/Iphone');
const iphoneRoutes = require('./routes/iphoneRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());              // Enable CORS
app.use(express.json());      // Parse JSON

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Root route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Optional quick endpoint to get names only
app.get('/api/iphones', async (req, res) => {
  try {
    const models = await Iphone.find({}, { "Model Name": 1, _id: 0 });
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Full iPhone API routes
app.use('/api/iphones', iphoneRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
});
