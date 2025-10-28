const mongoose = require('mongoose');
const { MONGO_URL } = require('./env');

async function connectDB() {
  await mongoose.connect(MONGO_URL);
  console.log('✅ MongoDB (Atlas) connected');
}
module.exports = { connectDB };
