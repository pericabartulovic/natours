export default function catchAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);         // it's a same as .catch(err => next(err)) ->> catch method will pass error to the next func.
  };                                        // so that error ends up in global errorhandling middlware
}
