import catchAsync from "../utils/catchAsync.mjs";
import AppError from "../utils/appError.mjs";

const handlerFactory = {
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
      data: {
        data: doc
      },
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
      data: {
        data: doc,
      },
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