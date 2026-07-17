'use strict';
const tap = require('tap');
const { errorHandler } = require('../src/middleware/errorHandler');
const { ApiError } = require('../src/utils/ApiError');

function fakeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

tap.test('errorHandler maps ApiError to its status with error envelope', async (t) => {
  const res = fakeRes();
  errorHandler(new ApiError(400, 'bad'), {}, res, () => {});
  t.equal(res.statusCode, 400);
  t.equal(res.body.success, false);
  t.equal(res.body.error.message, 'bad');
  t.end();
});

tap.test('errorHandler maps unknown error to 500 envelope', async (t) => {
  const res = fakeRes();
  errorHandler(new Error('boom'), {}, res, () => {});
  t.equal(res.statusCode, 500);
  t.equal(res.body.success, false);
  t.ok(res.body.error.message);
  t.end();
});
