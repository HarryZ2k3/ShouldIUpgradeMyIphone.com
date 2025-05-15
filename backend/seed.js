const mongoose = require('mongoose');
const dotenv = require('dotenv');
const csv = require('csvtojson');
const iPhone = require('./models/Iphone');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const CSV_FILE_PATH = './iPhone_Comparison_Data_Final.csv';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    const rawData = await csv().fromFile(CSV_FILE_PATH);

    const transformed = rawData.map(row => ({
      modelName: row["Model Name"],
      releaseDate: row["Release Date"],
      display: {
        sizeInches: parseFloat(row["Screen Size (inches)"]),
        type: row["Display Type"],
        resolution: row["Resolution"],
        refreshRate: row["Refresh Rate (Hz)"]
      },
      processor: row["Processor"],
      ramGB: parseFloat(row["RAM (GB)"]),
      storageOptions: row["Storage options"]?.split(',').map(s => s.trim()),
      battery: {
        capacitymAh: parseInt(row["Battery Capacity (mAh)"]),
        lifeHours: parseFloat(row["Battery Life (hrs)"]),
        chargingSpeed: row["Charging Speed"]
      },
      camera: {
        rear: row["Rear Camera Setup"],
        front: row["Front Camera Specs"],
        lidar: row["LIDAR Sensor"]
      },
      os: row["iOS Version at Launch"],
      buildMaterial: row["Build Material"],
      weightGrams: parseFloat(row["Weight (g)"]),
      waterResistance: row["Water/Dust Resistance"],
      priceUSD: parseFloat(row["Original Price ($)"]),
      dimensions: row["Dimensions (HxWxD mm)"]
    }));

    await iPhone.deleteMany();
    await iPhone.insertMany(transformed);

    console.log(`✅ Inserted ${transformed.length} structured iPhones`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();
