import Review from '../models/reviewModel.mjs';
import factory from './handlerFactory.mjs';
// import catchAsync from '../utils/catchAsync.mjs';

const reviewController = {
  setUserIds: (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
  },

  getAllreviews: factory.getAll(Review),
  createReview: factory.createOne(Review),
  getReview: factory.getOne(Review),
  updateReview: factory.updateOne(Review),
  deleteReview: factory.deleteOne(Review),
};

export default reviewController;