import mongoose from 'mongoose';
import catchAsync from "../utils/catchAsync.mjs";
import AppError from "../utils/appError.mjs";
import APIFeatures from "../utils/apiFeatures.mjs";

// Utility to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}


const handlerFactory = {
  getAll: Model => catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    //BUILD QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // EXECUTE QUERY
    // const docs = await features.mongoQuery.explain();
    const docs = await features.mongoQuery;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: docs.length,
      [`${Model.modelName.toLowerCase()}s`]: docs,
    });
  }),

  createOne: Model => catchAsync(async (req, res, next) => {
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

    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      [`${Model.modelName.toLowerCase()}`]: doc
    });
  }),

  getOne: (Model, populateOptions) => catchAsync(async (req, res, next) => {
    // let query = Model.findById(req.params.id);
    let query;
    if (isValidObjectId(req.params.id)) {
      query = Model.findById(req.params.id);
    } else {
      query = Model.findOne({ slug: req.params.id });
    }

    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID or Name', 404)); // return --> to exit func immediately and not to proceed to next line...
    }

    res.status(200).json({
      status: 'success',
      [`${Model.modelName.toLowerCase()}`]: doc,
    });
  }),

  updateOne: Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //returns new, updated document
      runValidators: true, // runs validators again same as in creation process -> see docsSchema in tourMode.mjs or other schema
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404)); // return --> to exit func immediately and not to proceed to next line...
    }

    res.status(200).json({
      status: 'success',
      [`${Model.modelName.toLowerCase()}`]: doc,
    });
  }),

  deleteOne: Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404)); // return --> to exit func immediately and not to proceed to next line...
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }),
}

export default handlerFactory;