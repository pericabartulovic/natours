import mongoose from 'mongoose';
import 'dotenv/config';
// import app from './app.mjs';

process.on('uncaughtException', err => {
  console.log("UNCAUGHT EXEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

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

const port = process.env.PORT || 3000;
let server;
try {
  const { default: app } = await import('./app.mjs');

  server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });
} catch (err) {
  console.log('🔥 Startup failed!');
  console.error(err);
  process.exit(1);
}
// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });


process.on("unhandledRejection", err => {
  console.log("UNHANDLER REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
