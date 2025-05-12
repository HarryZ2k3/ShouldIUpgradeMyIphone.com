const mongoose = require('mongoose');
const dotenv = require('dotenv');
const csv = require('csvtojson');
const iPhone = require('./models/Iphone');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const CSV_FILE_PATH = './iPhone_Comparison_Data_Final.csv'; // place the file in the root folder

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const jsonArray = await csv().fromFile(CSV_FILE_PATH);
    await iPhone.deleteMany(); // Optional: Clear old entries
    await iPhone.insertMany(jsonArray);

    console.log(`✅ Successfully inserted ${jsonArray.length} iPhone records`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();
