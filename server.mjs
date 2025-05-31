import mongoose from 'mongoose';
import 'dotenv/config';
import app from './app.mjs';

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
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
