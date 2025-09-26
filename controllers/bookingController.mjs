import Stripe from 'stripe';
import Booking from '../models/bookingModel.mjs';
import Tour from '../models/tourModel.mjs';
import AppError from '../utils/appError.mjs';
import catchAsync from '../utils/catchAsync.mjs';
import handlerFactory from './handlerFactory.mjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const bookingController = {
  createBooking: handlerFactory.createOne(Booking),
  getAllBookings: handlerFactory.getAll(Booking),
  getBookingById: handlerFactory.getOne(Booking),
  updateBooking: handlerFactory.updateOne(Booking),
  deleteBooking: handlerFactory.deleteOne(Booking),

  createCheckoutSession: catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);

    if (!tour) {
      return next(new AppError('There is no tour with that ID', 404));
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      // ⚠️ NOTE: In course, a temporary hack with query strings is used to create bookings after checkout.
      // Skipping that here — will implement proper booking creation using Stripe Webhooks once deployed.
      success_url: `${req.protocol}://${req.get('host')}/`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: tour.price * 100, // must be in cents
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [
                `https://mydomain.com/img/tours/${tour.imageCover}`,
              ],
            },
          },
          quantity: 1,
        },
      ],
    });

    res.status(200).json({
      status: 'success',
      id: session.id,
      url: session.url
    });
  }),
};

export default bookingController;
