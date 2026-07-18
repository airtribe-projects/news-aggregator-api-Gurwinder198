'use strict';
const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const { ApiError } = require('../utils/ApiError');

function auth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Authentication required'));
  }
  try {
    const payload = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
    req.userId = payload.userId;
    next();
  } catch (_e) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

module.exports = { auth };
