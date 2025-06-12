import User from '../models/userModel.mjs';
import catchAsync from '../utils/catchAsync.mjs';

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