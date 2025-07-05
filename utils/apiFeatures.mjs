import qs from 'qs';

export default class APIFeatures {
  constructor(mongoQuery, reqQuery) {
    this.mongoQuery = mongoQuery;
    this.reqQuery = reqQuery;
  }

  filter() {
    //BUILD QUERY
    /* In an older version of Express, where query strings like this:
    ?duration[gte]=5&difficulty=easy   -> from 'http://localhost:3000/api/v1/tours?duration[gte]=5&difficulty=easy'
    are parsed like this:
    { difficulty: 'easy', duration: { gte: '5' }}
    But in modern Express(v4.16 + with the default parser), the same query is parsed literally:
    { difficulty: 'easy', 'duration[gte]': '5' }
    So duration[gte] is just a string key — Express doesn’t parse it into nested objects anymore by default.
    That's why we need 'qs' module*/
    // 1A) Filtering
    const queryStringified = qs.stringify(this.reqQuery);
    const queryObj = qs.parse(queryStringified);
    // const queryObj = { ...this.reqQuery };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering (gte, gt, etc.)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    const isStrictNumeric = value =>
      typeof value === 'string' && /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(value);
    const parsedQuery = JSON.parse(queryStr, (key, value) => isStrictNumeric(value) ? Number(value) : value);

    this.mongoQuery = this.mongoQuery.find(parsedQuery);

    return this;
  }

  sort() {                                            // this logic here cause couldn't get hpp() lib to do its job
    if (this.reqQuery.sort) {
      let sortParam = this.reqQuery.sort;
      if (Array.isArray(sortParam)) {
        sortParam = sortParam.at(-1); // or [0] for first value
      }

      if (sortParam) {
        const sortBy = sortParam.split(',').join(' ');
        this.mongoQuery = this.mongoQuery.sort(sortBy);
      } else {
        this.mongoQuery = this.mongoQuery.sort('-createdAt _id');
      }
    }

    return this;
  }

  limitFields() {
    if (this.reqQuery.fields) {
      let { fields } = this.reqQuery;
      if (Array.isArray(fields)) {
        fields = fields.at(-1); // Or pick the first one you want
      }
      fields = fields.split(',').join(' ');
      this.mongoQuery = this.mongoQuery.select(fields);     //////// PROJECTING  ////////////
    } else {
      this.mongoQuery = this.mongoQuery.select('-__v');  // .select + or - === include or exclude fields
    }
    return this;
  }

  paginate() {
    // ?page=2&limit=10 1-10, page 1, 11-20, page 2 ...
    const page = +this.reqQuery.page || 1;
    const limit = +this.reqQuery.limit || 100;
    const skip = (page - 1) * limit;

    this.mongoQuery = this.mongoQuery.skip(skip).limit(limit);
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }

    return this;
  }
}