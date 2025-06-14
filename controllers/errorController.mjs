import AppError from "../utils/appError.mjs";

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
  // const value = err.errorResponse.errmsg.match(/(["'])(.*?)\1/)[0]; //reg expression to look up name between quotes in string
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

const sendErrorProd = (err, res) => {
  if (err.isOperational) {             // Operational, trusted error: send message to client
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {                              // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);    // 1) Log error
    res.status(500).json({             // 2) Send generic message
      status: 'error',
      message: 'Something went very wrong!'
    })
  }
}

const globalErrorHandler = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };  //to avoid alternating original object
    // let error = Object.create(err);

    if (err.name === 'CastError')
      error = handleCastErrorDB(error);

    if (err.code === 11000)
      error = handleDuplicateFieldsDB(error);

    if (err.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    if (err.name === 'JsonWebTokenError')
      error = handleJWTError();

    if (err.name === 'TokenExpiredError')
      error = handleJWTExpiredError();


    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
