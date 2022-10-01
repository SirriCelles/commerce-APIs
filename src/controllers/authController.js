const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsyc');

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

  const expiresIn = process.env.JWT_EXPIRES_IN;
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });
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
