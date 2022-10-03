const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
    role: {
      type: String,
      enum: ['user', 'admin', 'keeper', 'clerk'],
      default: 'user',
    },
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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
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

// create passwordUpdatedAt function
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Check password hash with DB password hash
// Instance method works on all documents of a certain Schema
userSchema.methods.correctPassword = async function (userPassword, dbpassword) {
  return await bcrypt.compare(userPassword, dbpassword);
};

userSchema.methods.changedPassword = async function (jwtTimestamp) {
  console.log(this.passwordChangedAt);
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return jwtTimestamp < changedTimestamp;
  }
  // return false;
};

// Create an instance method for forgot password.
userSchema.methods.createPasswordResetToken = function () {
  // random string but not to strong
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
