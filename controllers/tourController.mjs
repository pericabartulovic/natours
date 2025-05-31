import Tour from '../models/tourModel.mjs';
import APIFeatures from '../utils/apiFeatures.mjs';

const tourController = {
  aliasTopTours: (req, res, next) => {               // prefilling query string (for user, so he doesn't need to)
    // req.query.sort = '-ratingsAverage,price';                            // for older versions of Express where queries were parsed
    // req.query.fields = 'ratingsAverage,price,name,difficulty,summary';   // for older versions of Express where queries were parsed
    // req.query.limit = '5';                                               // for older versions of Express where queries were parsed
    req.url =
      "/?sort=-ratingsAverage,price&fields=ratingsAverage,price,name,difficulty,summary&limit=5";  // needed bcs url is parsed in newer versions: const queryObj = qs.parse(req._parsedUrl.query);
    next();
  },

  getAllTours: async (req, res) => {
    try {
      // const queryObj = { ...req.query };
      /* In an older version of Express, where query strings like this:
      ?duration[gte]=5&difficulty=easy   -> from 'http://localhost:3000/api/v1/tours?duration[gte]=5&difficulty=easy'
      are parsed like this:
      { difficulty: 'easy', duration: { gte: '5' }}
      But in modern Express(v4.16 + with the default parser), the same query is parsed literally:
      { difficulty: 'easy', 'duration[gte]': '5' }
      So duration[gte] is just a string key — Express doesn’t parse it into nested objects anymore by default.
      That's why we need 'qs' module*/

      //BUILD QUERY
      // 1A) Filtering
      // const queryObj = qs.parse(req._parsedUrl.query);
      // const excludedFields = ['page', 'sort', 'limit', 'fields'];
      // excludedFields.forEach(el => delete queryObj[el]);

      // // 1B) Advanced filtering
      // let queryStr = JSON.stringify(queryObj);
      // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

      // // const isNumeric = value => !Number.isNaN(Number(value));
      // const isStrictNumeric = value =>
      //   typeof value === 'string' && /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(value); // more liable method. for larger projects using library is more common.

      // const parsedQuery = JSON.parse(queryStr, (key, value) => isStrictNumeric(value) ? Number(value) : value) // convert numeric-looking strings to numbers

      // let query = Tour.find(parsedQuery);
      //OR: in mongoose
      /* const tours = Tour.find()
        .where('duration').equals(5)
        .where('difficulty').equals('easy') */

      // 2) Sorting
      // if (req.query.sort) {
      //   const sortBy = req.query.sort.split(',').join(' ');
      //   query = query.sort(sortBy);
      //   // .sort('price ratingsAverage') //mongoose -> so if we sort ?sort=-price,ratingsAverage we need to get rid of ','.
      // } else {
      //   query = query.sort('-createdAt _id');
      // }

      // 3) Field limiting
      // if (req.query.fields) {
      //   const fields = req.query.fields.split(',').join(' ');
      //   query = query.select(fields);     //////// PROJECTING  ////////////
      // } else {
      //   query = query.select('-__v'); // '-' in front of parameter/field excludes that field. 
      // }

      // 4) Pagination
      // const page = req.query.page * 1 || 1;
      // const limit = req.query.limit * 1 || 100;
      // const skip = (page - 1) * limit;

      // // ?page=2&limit=10 1-10, page 1, 11-20, page 2 ...
      // query = query.skip(skip).limit(limit);

      // if (req.query.page) {
      //   const numTours = await Tour.countDocuments();
      //   if (skip >= numTours) throw new Error('This page does not exist');
      // }

      const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      // EXECUTE QUERY
      const tours = await features.mongoQuery;

      // SEND RESPONSE
      res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
          tours,
        },
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message,

      })
    }
  },

  getTour: async (req, res) => {
    /*
      for optional paramater we add ? eg. '/api/v1/tours/:id/x?' 
      then on request to '/api/v1/tours/5' /x is ommited - cl would return:
      { id: 5, x: undefined}
     */
    // const id = +req.params.id;
    // const tour =  tours[id] -> data could be erased from base so shifted it could return wrong element based on position in array...
    // const tour = tours.find((t) => t.id === id);   // safe and dynamic approach

    try {
      const tour = await Tour.findById(req.params.id);
      //OR:      = await Tour.findOne({_id: req.params.id}) >>><<< findById(req.params.id) is shorthand for it.
      res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message,
      })
    }
  },

  createTour: async (req, res) => {
    try {
      // const newTour = new Tour(req.body);
      // newTour.save();
      /**
       * .save() method is available from Mongoose 'model Class' and it is applicable only on 'document' (here: newTour -> newly created through 'new Tour(req.body);').
       * 📌 When to use .save() over .create()
        ✅ Use .create() when you're inserting immediately — it's concise.
        ✅ Use .save() when:
        You want to manipulate fields before saving (e.g., generate slugs, timestamps).
        You need to run custom instance methods before committing.
        You want to handle multiple steps before final persistence.
      */

      const newTour = await Tour.create(req.body);
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        },
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        // message: 'Invalid data sent!',
        message: err.message,
      });
    }
  },


  updateTour: async (req, res) => {
    try {
      const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, //returns new, updated document
        runValidators: true, // runs validators again same as in creation process -> see toursSchema in tourMode.mjs
      });
      res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        // message: 'Invalid data sent!',
        message: err.message,
      });
    }
  },

  deleteTour: async (req, res) => {
    try {
      await Tour.findByIdAndDelete(req.params.id);
      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message
      })
    }
  },

  getTourStats: async (req, res) => {
    try {
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
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message
      })
    }
  },

  getMonthlyPlan: async (req, res) => {
    try {
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
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message
      })
    }
  },
};

export default tourController;