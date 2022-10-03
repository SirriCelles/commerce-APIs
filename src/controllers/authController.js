const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsyc');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

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
  user.password = undefined;
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
  // Send token
  const token = generateToken(user._id);
  user.password = undefined;
  res.status(200).json({
    status: 'success',
    data: {
      user: user,
      token: {
        accessToken: token,
        expiresIn: expiresIn,
      },
    },
  });
});

// middleware
exports.protect = catchAsync(async (req, res, next) => {
  // get the token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Unauthorized access, please log in first', 401));
  }
  // Validate/verify  the token
  const decocodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // check if user still exists,
  const user = await User.findById(decocodedPayload.id);
  if (!user) {
    return next(new AppError('The user for this token was not found', 400));
  }

  // check if user chnaged password after the jwt was issued
  if (user.changedPassword(decocodedPayload.iat)) {
    return next(
      new AppError('Your password was changed. Please log In again.', 401)
    );
  }

  req.user = user;
  next();
});

// authirzation middleware, roles. accepts roles array and checks if user has this role.
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // Check if user has roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'Access denied. You do not have permission to perform this action',
          403
        )
      );
    }

    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user form rerquest.email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new AppError(
        `User not found! There is no user with email ${req.body.email}`
      )
    );

  // Generate radom token
  const resetToken = user.createPasswordResetToken();

  // Deactivated validated fieilds
  await user.save({ validateBeforeSave: false });

  // Send to user email address
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/auth/resetPassword/${resetToken}`;

  const message = `Forgot your password? Click the link below and provide a new password.\n
  ${resetUrl}\n
  If you did not initiate a password reset, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset link. Valid for 60 minutes',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'reset password email sent',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending email. Please try again later.',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on token
  if (!req.params.token)
    return next(new AppError('Reset token string Not found', 403));

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // If token has not expired and there is user, set the new password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  user.password = req.body.password;
  user.confirmedPassword = req.body.confirmedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Update the changedPasswordAt property for the user
  // Log in user
  const token = generateToken(user._id);
  user.password = undefined;
  res.status(200).json({
    status: 'success',
    data: {
      user: user,
      token: {
        accessToken: token,
        expiresIn: expiresIn,
      },
    },
  });
});
