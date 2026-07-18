'use strict';
const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

async function connectDB(uri) {
  await mongoose.connect(uri);
  logger.info('MongoDB connected');
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
