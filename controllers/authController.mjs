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
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
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
      console.log('user.password:', user?.password);
      return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  }),
};

export default authController;
