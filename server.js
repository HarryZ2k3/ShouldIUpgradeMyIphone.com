// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const Iphone = require('./models/Iphone');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Test Route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Fetch all iPhones
app.get('/api/iphones', async (req, res) => {
  try {
    const models = await Iphone.find({}, 'name'); // Only fetch name for dropdown
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// 🧪 Future: Endpoint to insert bulk from Excel
// app.post('/api/iphones/bulk', async (req, res) => { ... });

app.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
});
