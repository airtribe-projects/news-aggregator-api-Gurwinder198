'use strict';
const tap = require('tap');

tap.test('env loads defaults in test mode', async (t) => {
  process.env.NODE_ENV = 'test';
  delete require.cache[require.resolve('../src/config/env')];
  const { config } = require('../src/config/env');
  t.equal(config.env, 'test');
  t.ok(config.jwt.secret, 'has a jwt secret');
  t.equal(config.cache.ttlMs, 600000);
  t.end();
});
