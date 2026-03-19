require('dotenv').config();
const mongoose = require('mongoose');
const uri = process.env.ATLASDB;

const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true }
};

module.exports = async function () {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log('===> Backend successfully connected to MongoDB!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    await mongoose.disconnect();
  }
};