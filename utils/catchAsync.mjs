export default function catchAsync(fn) {
  console.log(fn);
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
