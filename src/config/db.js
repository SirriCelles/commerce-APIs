const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

const connectDB = async () => {
  try {
    mongoose.connect(DB, {});
    console.log('Romis DB Connection Success 👍');
  } catch (error) {
    console.log('Romis DB Connection Failed 💥');
    process.exit(1);
  }
};

module.exports = connectDB;
