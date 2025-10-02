import express from 'express';
import bookingController from '../controllers/bookingController.mjs';
import authController from '../controllers/authController.mjs';

const router = express.Router();

router.use(authController.protect)

router
  .get('checkout-session/:session_id', bookingController.retrievePaymentStatus)
  .post(
    '/checkout-session/:tourId',
    bookingController.createCheckoutSession
  )

router.use(authController.restrictTo('admin', 'lead-guide'))

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking)

router
  .route('/:id')
  .get(bookingController.getBookingById)
  .patch(bookingController.updateBooking)
  .delete(
    authController.restrictTo('admin', 'lead-guide'),
    bookingController.deleteBooking
  );

export default router;