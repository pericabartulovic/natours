import Review from '../models/reviewModel.mjs';
import AppError from '../utils/appError.mjs';
import catchAsync from '../utils/catchAsync.mjs';
import factory from './handlerFactory.mjs';

const reviewController = {
  getAllreviews: catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const reviews = await Review.find(filter);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      },
    });
  }),

  setUserIds: (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    next();
  },

  createReview: factory.createOne(Review),

  getReview: catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new AppError('No review found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        review,
      }
    })
  }),

  updateReview: factory.updateOne(Review),
  deleteReview: factory.deleteOne(Review),
};

export default reviewController;