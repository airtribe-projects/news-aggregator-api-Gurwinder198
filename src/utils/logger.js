'use strict';
const pino = require('pino');
const { config } = require('../config/env');
const logger = pino({
  level: config.isTest ? 'silent' : 'info',
});
module.exports = { logger };
