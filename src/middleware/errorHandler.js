'use strict';
const { ApiError } = require('../utils/ApiError');
const { logger } = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, error: { message: err.message } });
  }
  logger.error({ err }, 'Unhandled error');
  return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
}

module.exports = { errorHandler };
