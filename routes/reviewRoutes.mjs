import express from 'express';
import reviewController from '../controllers/reviewController.mjs';
import authController from '../controllers/authController.mjs';

const router = express.Router();

router
  .route('/')
  .get(reviewController.getAllreviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)

export default router;