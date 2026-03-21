require("dotenv").config();
const mongoose = require("mongoose");

async function testConnection() {
  try {
    console.log("URI loaded:", !!process.env.ATLASDB);
    await mongoose.connect(process.env.ATLASDB);
    console.log("MongoDB connected successfully");
    process.exit(0);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
