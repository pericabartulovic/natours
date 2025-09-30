import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';                 //Help secure Express apps by setting HTTP response headers
import sanitize from 'mongo-sanitize';
import sanitizeHtml from 'sanitize-html';
import hpp from 'hpp';
import qs from 'qs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import path from 'path';
import { fileURLToPath } from 'url';

import tourRouter from './routes/tourRoutes.mjs';
import userRouter from './routes/userRoutes.mjs';
import reviewRouter from './routes/reviewRoutes.mjs';
import bookingRouter from './routes/bookingRoutes.mjs';
import bookingController from './controllers/bookingController.mjs';
import AppError from './utils/appError.mjs';
import globalErrorHandler from './controllers/errorController.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//////////////// 1. GLOBAL MIDDLWARES ///////////////////
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());         //always as first middleware

app.use(cors({
  origin: [
    process.env.CLIENT_ORIGIN,
    process.env.DEVELOPMENT_BASE_URL,
    'http://localhost:4200',
  ],
  credentials: true
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Trust the proxy (Render sets X-Forwarded-For)
app.set('trust proxy', 1);

// Limit requests from same IP
const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests from this IP, please try again in one hour!'
});

app.use('/api', limiter);

app.post('/webhook-checkout', express.raw({ type: 'application/json' }), bookingController.webhookCheckout);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Secure query string parsing (prevents prototype pollution via query)
app.set('query parser', str => qs.parse(str, { allowPrototypes: false }));

const sanitizePrototypePollution = (obj) => {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    Object.keys(obj).forEach(key => {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) {
        delete obj[key];
      } else {
        sanitizePrototypePollution(obj[key]);
      }
    });
  }
};

// 🚨 Sanitize against prototype pollution
app.use((req, res, next) => {
  sanitizePrototypePollution(req.body);
  sanitizePrototypePollution(req.query);
  sanitizePrototypePollution(req.params);
  next();
});

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      // allow duplicates for these query params (optional)
      'duration',
      'price',
      'difficulty',
      'maxGroupSize',
      'ratingsAverage',
      'ratingsQuantity',
    ]
  })
);

// Data sanitization against NoSQL query injection
app.use((req, res, next) => {
  // Sanitize req.body safely by replacing
  if (req.body) {
    req.body = sanitize(req.body);
  }

  // Sanitize req.query IN-PLACE (mutate keys)
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      req.query[key] = sanitize(req.query[key]);
    });
  }

  // Sanitize req.params IN-PLACE (mutate keys)
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      req.params[key] = sanitize(req.params[key]);
    });
  }
  next();
});

// Data sanitization against XSS
app.use((req, res, next) => {
  if (req.body) {
    Object.entries(req.body).forEach(([key, value]) => {
      if (typeof value === 'string') {
        req.body[key] = sanitizeHtml(value);
      }
    });
  }

  if (req.query) {
    Object.entries(req.query).forEach(([key, value]) => {
      if (typeof value === 'string') {
        req.query[key] = sanitizeHtml(value);
      }
    });
  }

  if (req.params) {
    Object.entries(req.params).forEach(([key, value]) => {
      if (typeof value === 'string') {
        req.params[key] = sanitizeHtml(value);
      }
    });
  }
  next();
});

app.use(compression());

// Test middleware - custom req attribute (here: requestTime)
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//////////////// 2. ROUTES ///////////////////
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));

  /* Whenever we pass anything into next, Express will assume that it is an error,
    and it will then skip all the other middlewares in the middleware
    stack and sent the error that we passed in to our global error handling middleware,
    which will then, of course, be executed.
  */
});

app.use(globalErrorHandler);

export default app;
