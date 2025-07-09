import mongoose from 'mongoose';
import Tour from './tourModel.mjs';

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review can not be empty!'],
    trim: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  tour:
  {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour.'],
    immutable: true,
  },
  user:
  {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user'],
    immutable: true,
  },
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // enforce that no combination of tour + user can occur more than once in the collection - only one review from user on tour

reviewSchema.pre(/^find/, function (next) {
  //   // this
  //   //   .populate({          // this is over populate for app ux
  //   //     path: 'tour',
  //   //     select: 'name'
  //   //   })
  //   //   .populate({
  //   //     path: 'user',
  //   //     select: 'name photo'
  //   //   });
  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

// STATIC METHOD
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
  // console.log(stats);
}

reviewSchema.post('save', function () {   // POST doesn't have access on next
  // 'this' points to current review
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate  //Mongoose doesn't give access to the actual document being modified inside pre/post middleware like it does with save or remove.
// findByIdAndDelete
// Workaround -> passing data from pre middleware to post middleware
// 1) Find referring document
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // Manually retrieve current doc and create property 'this.r' later accessable in next middleware
  this.r = await this.clone().findOne();    // Mongoose no longer allows executing the same query object twice so we need clone(). first time: await Tour.findByIdAndUpdate(tourId, {... see above...
  // console.log(this.r);
  next();
});

// 2) Make calculations in post middleware
reviewSchema.post(/^findOneAnd/, async function () {
  // await this.clone().findOne();  does NOT work here, query has already executed
  // this.r.constructor === mongoose.model('Review')
  await this.r.constructor.calcAverageRatings(this.r.tour); // this.r.tour is the tour field on that review document = id
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;