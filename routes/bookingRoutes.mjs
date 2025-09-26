import express from 'express';
import bookingController from '../controllers/bookingController.mjs';
import authController from '../controllers/authController.mjs';

const router = express.Router();

router
  .route('/')
  .get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), bookingController.getAllBookings)
  .post(authController.protect, bookingController.createBooking)

router
  .route('/:id')
  .get(authController.protect, bookingController.getBookingById)
  .patch(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), bookingController.updateBooking)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    bookingController.deleteBooking
  );

router
  .post(
    '/checkout-session/:tourId',
    authController.protect,
    bookingController.createCheckoutSession
  )

export default router;