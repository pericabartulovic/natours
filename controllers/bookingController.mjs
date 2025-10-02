import Stripe from 'stripe';
import Booking from '../models/bookingModel.mjs';
import Tour from '../models/tourModel.mjs';
import AppError from '../utils/appError.mjs';
import catchAsync from '../utils/catchAsync.mjs';
import handlerFactory from './handlerFactory.mjs';
import User from '../models/userModel.mjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const bookingController = {
  createBooking: handlerFactory.createOne(Booking),
  getAllBookings: handlerFactory.getAll(Booking),
  getBookingById: handlerFactory.getOne(Booking),
  updateBooking: handlerFactory.updateOne(Booking),
  deleteBooking: handlerFactory.deleteOne(Booking),

  createCheckoutSession: catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) return next(new AppError('There is no tour with that ID', 404));

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.CLIENT_ORIGIN}/users/me/my-bookings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_ORIGIN}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: tour.price * 100, // cents
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [
                `https://natours-chb9.onrender.com/img/tours/${tour.imageCover}`,
              ],
            },
          },
          quantity: 1,
        },
      ],
    });

    // 3) Send session details
    res.status(200).json({
      status: 'success',
      id: session.id,
      url: session.url,
    });
  }),

  createBookingCheckout: async (session) => {
    // Ensure paid and avoid duplicates
    if (session.mode !== 'payment' || session.payment_status !== 'paid') return;
    // Idempotency: skip if already fulfilled for this session
    const existing = await Booking.findOne({ stripeSessionId: session.id });
    if (existing) return;

    // Resolve user and tour
    const tourId = session.client_reference_id || session.metadata?.tourId;
    let userId = null;
    if (session.customer_email) {
      const userDoc = await User.findOne({ email: session.customer_email });
      userId = userDoc?.id;
    }
    if (!tourId || !userId) return;

    // Amount in cents -> major units
    const amountCents = session.amount_total ?? session?.line_items?.data?.[0]?.amount_total;
    if (!amountCents) return;
    const price = amountCents / 100;

    await Booking.create({
      tour: tourId,
      user: userId,
      price,
      paid: true,
      stripeSessionId: session.id
    });
  },

  webhookCheckout: async (req, res) => {
    const signature = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = await stripe.checkout.sessions.retrieve(event.data.object.id, { expand: ['line_items'] });
      // Kick off fulfillment, but don't block the webhook; log errors
      bookingController.createBookingCheckout(session).catch(err => console.error('Booking creation failed:', err));
    }

    res.status(200).json({ received: true });
  },

  retrievePaymentStatus: catchAsync(async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.params.id);

    res.status(200).json({
      payment_status: session.payment_status
    });
  })
};

export default bookingController;
