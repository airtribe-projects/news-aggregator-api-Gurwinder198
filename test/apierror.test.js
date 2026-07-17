'use strict';
const tap = require('tap');
const { ApiError } = require('../src/utils/ApiError');

tap.test('ApiError carries statusCode and message', async (t) => {
  const err = new ApiError(404, 'Not found');
  t.equal(err.statusCode, 404);
  t.equal(err.message, 'Not found');
  t.ok(err instanceof Error);
  t.end();
});
