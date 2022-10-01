const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

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
      select: false,
    },
    confirmedPassword: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // Only works on Save() and create() .Note Use save() or create() for updating user information.
        validator: function (el) {
          return el === this.password;
        },
        message: 'Password mismatch. Please try again',
      },
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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmedPassword = undefined;
  next();
});

// Check password hash with DB password hash
// Instance method works on all documents of a certain Schema
userSchema.methods.correctPassword = async function (userPassword, dbpassword) {
  return await bcrypt.compare(userPassword, dbpassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
