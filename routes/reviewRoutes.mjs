import express from 'express';
import reviewController from '../controllers/reviewController.mjs';
import authController from '../controllers/authController.mjs';

const router = express.Router({ mergeParams: true });  // by default each router has access to its specific params so with merging it has access to params from other routes, in this case to tourId

// POST /tour/234sdf2/reviews
// GET /tour/234sdf2/reviews
// POST /reviews
// Both of rout patterns will end up in this rout thanks to router.use('/:tourId/reviews', reviewRouter); from tour router

router
  .route('/')
  .get(reviewController.getAllreviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect,
    reviewController.checkImmutableFields,
    authController.restrictTo('admin', 'user'),
    reviewController.checkReviewOwnership,
    reviewController.updateReview)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    reviewController.checkReviewOwnership,
    reviewController.deleteReview
  );

export default router;