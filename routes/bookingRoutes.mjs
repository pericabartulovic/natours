import express from 'express';
import bookingController from '../controllers/bookingController.mjs';
import authController from '../controllers/authController.mjs';

const router = express.Router();

router.post('/', authController.protect, bookingController.createBooking)

router
  .post(
    '/checkout-session/:tourId',
    authController.protect,
    bookingController.createCheckoutSession
  )

export default router;