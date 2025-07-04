import catchAsync from "../utils/catchAsync.mjs";
import AppError from "../utils/appError.mjs";

const handlerFactory = {
  deleteOne: Model =>
    catchAsync(async (req, res, next) => {
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