import { promisify } from 'util';                 // promisify() converts a callback-based function into one that returns a Promise
import jwt from 'jsonwebtoken';
import User from "../models/userModel.mjs";
import catchAsync from "../utils/catchAsync.mjs";
import AppError from '../utils/appError.mjs';

const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});


const authController = {
  signup: catchAsync(async (req, res, next) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      }
    });
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
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  }),

  protect: catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's therr
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
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

    // next();
  }),

  resetPassword: (req, res, next) => { }
};

export default authController;
