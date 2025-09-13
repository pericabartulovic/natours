import multer from 'multer';
import sharp from 'sharp';
import Tour from '../models/tourModel.mjs';
import AppError from '../utils/appError.mjs';
import catchAsync from '../utils/catchAsync.mjs';
import factory from './handlerFactory.mjs';

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. Please upload only images', 400), false)
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const tourController = {
  totalSlots: 3, // TODO: refactor to CONSTANTS

  resizeTourImages: catchAsync(async (req, res, next) => {
    if (!req.files) return next();

    let imagesIndexes = [];
    try {
      imagesIndexes = req.body.imagesIndexes ? JSON.parse(req.body.imagesIndexes) : [];
    } catch (err) {
      imagesIndexes = [];
    }

    // Remove imagesIndexes from req.body!! so it doesn't overwrite the tour document
    delete req.body.imagesIndexes;

    // Retrieve existing tour document early to access old images
    const doc = await Tour.findById(req.params.id);
    if (!doc) return next(new AppError('No document found with that ID', 404));
    const oldImages = Array.isArray(doc.images) ? doc.images : [];

    if (req.files.imageCover) {
      req.body.imageCover = `tour-${req.params.id ? `${req.params.id}-` : ''}${Date.now()}-cover.jpeg`;

      await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);
    }

    if (req.files.images) {
      req.body.images = Array(tourController.totalSlots).fill('');

      // Assign uploaded files to correct slots using imagesIndexes mapping
      await Promise.all(
        req.files.images.map(async (file, idx) => {
          const slotIndex = imagesIndexes[idx];

          if (typeof slotIndex !== 'number' || slotIndex < 0 || slotIndex >= tourController.totalSlots) {
            return;
          }

          const fileName = `tour-${req.params.id || Date.now()}-${slotIndex + 1}.jpeg`;

          await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${fileName}`);

          req.body.images[slotIndex] = fileName;
        })
      );

      // Preserve old filenames for slots without new upload
      for (let i = 0; i < tourController.totalSlots; i += 1) {
        if (!req.body.images[i]) {
          req.body.images[i] = oldImages[i] || '';
        }
      }
    }

    next();
  }),

  // In case we have only multiple images or files:
  // uploadTourImages: upload.array('images', 5), req.files
  // Single:
  // uploadTourImage: upload.single('image'), req.file

  //Mix:
  uploadTourImages: upload.fields([
    {
      name: 'imageCover',
      maxCount: 1
    },
    {
      name: 'images',
      maxCount: 3
    }
  ]),

  updateTourData: catchAsync(async (req, res, next) => {
    const doc = await Tour.findById(req.params.id);
    if (!doc) return next(new AppError('No document found with that ID', 404));

    const existingImages = Array.isArray(doc.images) ? doc.images : [];
    let incomingImages = req.body.images;
    // Normalize
    if (!Array.isArray(incomingImages)) incomingImages = [incomingImages];
    while (incomingImages.length < tourController.totalSlots) incomingImages.push('');

    // Build merged array
    const mergedImages = incomingImages.map((img, idx) => {
      if (img && img.endsWith('.jpeg')) {
        return img;
      }
      if (!img || img === '') {
        return existingImages[idx] || '';
      }
      return '';
    });

    doc.images = mergedImages;
    doc.set(req.body); // update other fields too
    await doc.save();

    res.status(200).json({
      status: 'success',
      tour: doc,
    });
  }),


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
  // updateTour will be assigned after tourController is defined
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
      next(new AppError('Please provide latitude and longitude in the format lat, lng.', 400));
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
      next(new AppError('Please provide latitude and longitude in the format lat, lng.', 400));
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

// Assign updateTour after tourController is defined to avoid reference error
tourController.updateTour = tourController.updateTourData;

export default tourController;