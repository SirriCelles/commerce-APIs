const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsyc');
const AppError = require('../utils/appError');

const expiresIn = process.env.JWT_EXPIRES_IN;
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: expiresIn });

exports.signup = catchAsync(async (req, res, next) => {
  // User cannot input a role
  const user = await User.create({
    fullname: req.body.fullname,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    confirmedPassword: req.body.confirmedPassword,
    address: req.body.address,
    DoB: req.body.DoB,
  });

  const token = generateToken(user._id);
  res.status(201).json({
    status: 'success',
    data: {
      user,
      token: {
        accessToken: token,
        expiresIn: expiresIn,
      },
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if emailand password exists
  if (!email || !password) {
    return next(new AppError('Email or Password required!', 400));
  }
  // check if user exists and password is valid
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }
  const newUser = { ...user };
  newUser.delete('password');

  // Send token
  const token = generateToken(user._id);
  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
      token: {
        accessToken: token,
        expiresIn: expiresIn,
      },
    },
  });
});
