import User from '../models/userModel.mjs';
import AppError from '../utils/appError.mjs';
import catchAsync from '../utils/catchAsync.mjs';

const filterOjb = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
}

const userController = {
  getAllUsers: catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  }),

  updateMe: catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400));
    }

    if (req.body.role) {
      return next(new AppError('You are not allowed to update your role!', 403))
    }

    // 2) Filter out unwanted fields name that are not allowed to be updated
    const filteredBody = filterOjb(req.body, 'name', 'email');

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      }
    });
  }),

  deleteMe: catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      staus: 'success',
      data: null,
    });
  }),

  getUser(req, res) {
    res.status(500).json({
      status: 500,
      message: "This route is not yet defined."
    })
  },

  createUser(req, res) {
    res.status(500).json({
      status: 500,
      message: "This route is not yet defined."
    })
  },

  updateUser(req, res) {
    res.status(500).json({
      status: 500,
      message: "This route is not yet defined."
    })
  },

  deleteUser(req, res) {
    res.status(500).json({
      status: 500,
      message: "This route is not yet defined."
    })
  }
}

export default userController;