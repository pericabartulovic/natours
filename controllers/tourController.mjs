import Tour from '../models/tourModel.mjs';
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
};

export default tourController;