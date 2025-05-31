import fs from 'fs';
import mongoose from 'mongoose';
import 'dotenv/config';
import { join } from 'path';

import Tour from '../../models/tourModel.mjs';

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB)
  .then(() => {
    console.log('DB connection successful!');
  });

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(join(process.cwd(), 'dev-data', 'data', 'tours-simple.json'), 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (error) {
    console.log(error);
  }
  process.exit(); // very brutal way to end process but for such small script it's acceptable here...
}


// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
}

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}