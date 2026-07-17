'use strict';
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const isTest = env === 'test';

function required(name, fallback) {
  const val = process.env[name] ?? fallback;
  if (val === undefined && !isTest) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return val;
}

const config = {
  env,
  isTest,
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: required('MONGO_URI', isTest ? 'mongodb://127.0.0.1:27017/test' : undefined),
  jwt: {
    secret: required('JWT_SECRET', isTest ? 'test-secret' : undefined),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  news: {
    apiKey: process.env.NEWSAPI_AI_KEY || '',
  },
  cache: {
    ttlMs: parseInt(process.env.NEWS_CACHE_TTL_MS || '600000', 10),
  },
};

module.exports = { config };
