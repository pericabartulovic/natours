// Import Mongoose to connect to MongoDB
import mongoose from 'mongoose';

// Load environment variables (e.g., DB credentials, port)
import 'dotenv/config';

// 🚨 Catches **synchronous exceptions** that are not handled anywhere
// This includes things like ReferenceError, TypeError etc.
// Must be placed at the very top before any other code runs
process.on('uncaughtException', err => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1); // Exit immediately with failure code
});

// Replace <PASSWORD> in DB string from .env
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// 🔌 Connect to MongoDB
mongoose
  .connect(DB
    // , {
    // useNewUrlParser: true,   //obsolete, only for older versions
    // useCreateIndex: true,
    // useFindAndModify: false,
    // }
  )
  .then(() => {
    console.log('DB connection successful!');
  });


// Set port from environment or use 3000 as default
const port = process.env.PORT || 3000;

// Store server instance so we can gracefully shut it down later
let server;
/**
 * Wrap the import of  app (or any ES module) in a try-catch or .catch() to catch load-time errors (like syntax errors or immediate runtime errors).
*/
try {
  // 📦 Dynamically import app (because top-level await is needed in ESM)
  // We use object destructuring to get the `default` export from the module and call it `app`
  const { default: app } = await import('./app.mjs');

  // 🏃 Start server and listen for requests
  server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });
} catch (err) {
  // 🧯 If app fails to load (e.g. syntax error, missing import), catch it here
  console.log('🔥 Startup failed!');
  console.error(err);
  process.exit(1); // Exit with failure
}

// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });

// 💥 Catch unhandled Promise rejections globally
// These are async errors not caught by .catch or try-catch
process.on("unhandledRejection", err => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);

  // Gracefully shut down server, then exit
  server.close(() => {
    process.exit(1);
  });
});
