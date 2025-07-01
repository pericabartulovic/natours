import Review from '../models/reviewModel.mjs';
import APIFeatures from '../utils/apiFeatures.mjs';
import AppError from '../utils/appError.mjs';
import catchAsync from '../utils/catchAsync.mjs';

const reviewController = {
  getAllreviews: catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Review.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const reviews = await features.mongoQuery;

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      },
    });
  }),

  createReview: catchAsync(async (req, res, next) => {
    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newReview
      },
    });
  }),

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
};

export default reviewController;