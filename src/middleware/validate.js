'use strict';
const { ApiError } = require('../utils/ApiError');

function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join(', ');
      return next(new ApiError(400, msg || 'Invalid request'));
    }
    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
