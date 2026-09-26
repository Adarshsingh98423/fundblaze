const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fundblaze';
  const conn = await mongoose.connect(uri, { autoIndex: true });
  console.log(`✅ MongoDB → ${conn.connection.host}/${conn.connection.name}`);
};

module.exports = { connectDB };
