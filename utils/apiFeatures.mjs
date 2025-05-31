import qs from 'qs';

export default class APIFeatures {
  constructor(mongoQuery, reqQuery) {
    this.mongoQuery = mongoQuery;
    this.reqQuery = reqQuery;
  }

  filter() {
    //BUILD QUERY
    // 1A) Filtering
    const queryStringified = qs.stringify(this.reqQuery);
    const queryObj = qs.parse(queryStringified);
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    const isStrictNumeric = value =>
      typeof value === 'string' && /^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(value);
    const parsedQuery = JSON.parse(queryStr, (key, value) => isStrictNumeric(value) ? Number(value) : value);

    this.mongoQuery = this.mongoQuery.find(parsedQuery);
    return this;
  }

  sort() {
    if (this.reqQuery.sort) {
      const sortBy = this.reqQuery.sort.split(',').join(' ');
      this.mongoQuery = this.mongoQuery.sort(sortBy);
    } else {
      this.mongoQuery = this.mongoQuery.sort('-createdAt _id');
    }
    return this;
  }

  limitFields() {
    if (this.reqQuery.fields) {
      const fields = this.reqQuery.fields.split(',').join(' ');
      this.mongoQuery = this.mongoQuery.select(fields);     //////// PROJECTING  ////////////
    } else {
      this.mongoQuery = this.mongoQuery.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = +this.reqQuery.page || 1;
    const limit = +this.reqQuery.limit || 100;
    const skip = (page - 1) * limit;

    this.mongoQuery = this.mongoQuery.skip(skip).limit(limit);
    return this;
  }
}