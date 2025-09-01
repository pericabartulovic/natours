import multer from 'multer';
import sharp from 'sharp';
import User from '../models/userModel.mjs';
import AppError from '../utils/appError.mjs';
import catchAsync from '../utils/catchAsync.mjs';
import factory from './handlerFactory.mjs';

// const multerStorage = multer.diskStorage({
//   destination: (req, res, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     //user-12345abc123ab-4565445654.jpeg -> user-[id]-[timestamp].jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. Please upload only images', 400), false)
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
}

const userController = {
  uploadUserPhoto: upload.single('photo'),

  resizeUserPhoto: catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.file.filename}`);

    next();
  }),

  getMe: catchAsync(async (req, res, next) => {
    req.params.id = req.user.id;
    next();
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
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;

    // 3) Update user document
    if (req.body.email && req.body.email !== req.user.email) {
      const existing = await User.findOne({ email: req.body.email });
      if (existing) {
        return next(new AppError('Email already in use. Please use another.', 400));
      }
    }

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
      status: 'success',
      data: null,
    });
  }),

  createUser(req, res) {
    res.status(500).json({
      status: 500,
      message: "This route is not yet defined. Please use /signup instead."
    })
  },

  getAllUsers: factory.getAll(User),
  // Do NOT update passwords with this!
  getUser: factory.getOne(User),
  updateUser: factory.updateOne(User),
  deleteUser: factory.deleteOne(User),
}

export default userController;