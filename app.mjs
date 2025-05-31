import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import tourRouter from './routes/tourRoutes.mjs';
import userRouter from './routes/userRoutes.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//////////////// 1. MIDDLWARES ///////////////////
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Custom req attribute (here: requestTime)
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//////////////// 2. ROUTES ///////////////////
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('/{*any}', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`
  // });

  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;

  next(err); /* Whenever we pass anything into next, Express will assume that it is an error, and it will then skip all the other middlewares in the middleware
          stack and sent the error that we passed in to our global error handling middleware, which will then, of course, be executed. */
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  })
});

export default app;
