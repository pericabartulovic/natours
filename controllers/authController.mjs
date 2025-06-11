import User from "../models/userModel.mjs";
import catchAsync from "../utils/catchAsync.mjs";

const authController = {
  signup: catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    res.status(201).json({
      status: 'success',
      user: newUser,
    });
  })
};

export default authController;
