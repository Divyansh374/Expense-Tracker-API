const { excludeObj } = require("./objectUtils");

class APIFeatures {
  constructor(query, queryString, searchFields) {
    this.query = query;
    this.queryString = queryString;
    this.searchFields = searchFields;
  }

  filter() {
    let filterObj = {};
    const queryObj = excludeObj(
      this.queryString,
      "page",
      "limit",
      "fields",
      "sort",
    );

    if (queryObj.search) {
      filterObj.$or = this.searchFields.map((field) => ({
        [field]: {
          $regex: queryObj.search,
          $options: "i",
        },
      }));
    }

    this.query = this.query.find(filterObj);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("_id");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-_v");
    }
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
