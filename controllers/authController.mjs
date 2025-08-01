import { promisify } from 'util';                 // promisify() converts a callback-based function into one that returns a Promise
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import User from "../models/userModel.mjs";
import catchAsync from "../utils/catchAsync.mjs";
import AppError from '../utils/appError.mjs';
import sendEmail from '../utils/email.mjs';

const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    user
  });
};

const authController = {
  signup: catchAsync(async (req, res, next) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      // role: req.body.role,  // 👈 this should NOT be allowed from the frontend
      role: 'user',            // ✅ Force to 'user' always
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
    });

    createSendToken(newUser, 201, res);
  }),

  login: catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400))
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');  // .select + or - === include or exclude fields

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
  }),

  logout: (req, res) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
  },

  protect: catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's therr
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verification token
    /**
     * promisify() converts a callback-based function into one that returns a Promise
     * .verify official docs: (Asynchronous) If a callback is supplied. (Synchronous) If a callback is not supplied
     * to stay on line with async await pattern instructor uses promisify and for cleaner code and to potentially work with catchAsync
     * It looks like this internally:
     * jwt.verify(token, secret, (err, decoded) => { ... }); 
     * //OR:
     * jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          // handle error
        }
        // use decoded
      });
     */
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user beloging to this token does not exist.', 401));
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password! Please login again.', 401))
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;           // >>>>>> CRUCIAL FOR NEXT MIDDLEWARE!!! <<<<<<
    next();
  }),

  restrictTo: (...roles) => (req, res, next) => {
    // roles ['admin', 'lead-guide']. current user has a role='user' for e.g. then:
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  },

  forgotPassword: catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with that email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const host = process.env.NODE_ENV === 'development' ? process.env.DEVELOPMENT_BASE_URL : process.env.PRODUCTION_BASE_URL
    // const resetURL = `${req.protocol}://${host}/api/v1/users/resetPassword/${resetToken}`
    const resetURL = `${req.protocol}://${host}/users/resetPassword/${resetToken}`

    // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}
                    \nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      })

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError('There was an error sending the email. Please, try again later.', 500));
    }
  }),

  resetPassword: catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gte: Date.now() } });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired.', 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // 3) Update changedPasswordAt property for the user
    await user.save();

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
  }),

  updatePassword: catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!user || !(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError('Incorrect current password, please try again', 401));
    }

    // 3) If correct, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Log in user, send JWT
    createSendToken(user, 200, res);
  }),
};

export default authController;
