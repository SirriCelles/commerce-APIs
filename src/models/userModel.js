const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'Full Name is required'],
      unique: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please enter a valid email'],
    },
    DoB: {
      type: Date,
    },
    address: {
      type: String,
    },
    photo: String,
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
    },
    confirmedPassword: {
      type: String,
      required: [true, 'Please confirm your password'],
      minlength: 8,
    },
    // favourites: [
    //   {
    //     type: String,
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
