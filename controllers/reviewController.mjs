import Review from '../models/reviewModel.mjs';
import factory from './handlerFactory.mjs';
import AppError from '../utils/appError.mjs';
import catchAsync from '../utils/catchAsync.mjs';

const reviewController = {
  setUserIds: (req, res, next) => {
    // Allow nested routes
    if (req.method === 'POST') {
      if (!req.body.tour) req.body.tour = req.params.tourId;
      if (!req.body.user) req.body.user = req.user.id;
    }

    next();
  },

  checkImmutableFields: (req, res, next) => {
    if (req.method === 'PATCH' || req.method === 'PUT') {
      if (req.body.tour || req.body.user) {
        return next(new AppError('Cannot change tour or user of a review', 400));
      }
    };

    next();
  },

  checkReviewOwnership: catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('No review found with that ID', 404));

    // Only allow if user is the review owner OR is an admin
    if (review.user.id !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to modify this review', 403));
    }

    next();
  }),

  getAllreviews: factory.getAll(Review),
  createReview: factory.createOne(Review),
  getReview: factory.getOne(Review),
  updateReview: factory.updateOne(Review),
  deleteReview: factory.deleteOne(Review),
};

export default reviewController;