import Tour from '../models/tourModel.mjs';
import AppError from '../utils/appError.mjs';
import catchAsync from '../utils/catchAsync.mjs';
import factory from './handlerFactory.mjs';
// import AppError from '../utils/appError.mjs';

const tourController = {
  aliasTopTours: (req, res, next) => {                                      // prefilling query string (for user, so he doesn't need to)
    // req.query.sort = '-ratingsAverage,price';                            // for older versions of Express where queries were parsed
    // req.query.fields = 'ratingsAverage,price,name,difficulty,summary';   // for older versions of Express where queries were parsed
    // req.query.limit = '5';                                               // for older versions of Express where queries were parsed
    req.url =
      "/?sort=-ratingsAverage,price&fields=ratingsAverage,price,name,difficulty,summary&limit=5";  // needed bcs url is parsed in newer versions: const queryObj = qs.parse(req._parsedUrl.query);
    next();
  },

  getAllTours: factory.getAll(Tour),
  getTour: factory.getOne(Tour, { path: 'reviews' }),
  createTour: factory.createOne(Tour),
  updateTour: factory.updateOne(Tour),
  deleteTour: factory.deleteOne(Tour),

  getTourStats: catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        }
      },
      {
        $sort: { avgPrice: 1 }
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  }),

  getMonthlyPlan: catchAsync(async (req, res, next) => {
    const year = +req.params.year;  // 2021
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0,
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: plan,
    });
  }),

  // /tours-within/:distance/center/:latlng/unit/:unit
  // // /tours-within/233/center/34.111745,-118.113491/unit/mi
  getToursWithin: catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1 // convert distance to radiants

    if (!lat || !lng) {
      next(new AppError('Please provide latitude and logitude in the format lat, lng.', 400));
    };

    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours,
      }
    });
  }),

  getDistances: catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
      next(new AppError('Please provide latitude and logitude in the format lat, lng.', 400));
    };

    const distances = await Tour.aggregate([
      {
        $geoNear: {           // always needs to be first in pipline and needs at least one of fields contains geospacial index, if there is more we neeed to use key to access one we need
          near: {
            type: 'Point',
            coordinates: [+lng, +lat]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        }
      },
      {
        $project: {
          distance: 1,
          name: 1,
        }
      }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        data: distances,
      }
    });
  }),
};

export default tourController;