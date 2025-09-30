import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!']
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price.']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  },
  stripeSessionId: {
    type: String,
    index: true,
    unique: true, // optional, if you guarantee one booking per session
    sparse: true, // allow docs without this field
  },
});

bookingSchema.index({ user: 1, tour: 1 });
bookingSchema.index({ createdAt: -1 });

bookingSchema.pre(/^find/, function (next) {
  this.populate({ path: 'tour', select: 'name price slug' })
    .populate({ path: 'user', select: 'name email' });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;