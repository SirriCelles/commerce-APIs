const catchAsync = require('../utils/catchAsyc');
const AppError = require('../utils/appError');

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if user tries to update password
  if (req.body.password || req.body.confrimedPassword) {
    return next(new AppError('This path is not for password update', 400));
  }

  // update user document
  res.status(200).json({
    status: 'success',
  });
});

// exports.create;
