'use strict';
const app = require('./app');
const { config } = require('./src/config/env');
const { connectDB } = require('./src/config/db');
const { logger } = require('./src/utils/logger');

async function start() {
  await connectDB(config.mongoUri);
  app.listen(config.port, () => logger.info(`Server listening on ${config.port}`));
}

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
