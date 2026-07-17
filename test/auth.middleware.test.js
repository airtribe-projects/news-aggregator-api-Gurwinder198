'use strict';
const tap = require('tap');
const jwt = require('jsonwebtoken');
const { config } = require('../src/config/env');
const { auth } = require('../src/middleware/auth');

function runAuth(req) {
  return new Promise((resolve) => {
    auth(req, {}, (err) => resolve({ err, req }));
  });
}

tap.test('auth attaches userId for valid token', async (t) => {
  const token = jwt.sign({ userId: 'abc' }, config.jwt.secret);
  const { err, req } = await runAuth({ headers: { authorization: `Bearer ${token}` } });
  t.equal(err, undefined);
  t.equal(req.userId, 'abc');
  t.end();
});

tap.test('auth rejects missing token with 401', async (t) => {
  const { err } = await runAuth({ headers: {} });
  t.equal(err.statusCode, 401);
  t.end();
});
