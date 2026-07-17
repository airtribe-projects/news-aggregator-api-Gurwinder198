'use strict';
const tap = require('tap');
const { validate } = require('../src/middleware/validate');
const { signupSchema } = require('../src/validation/schemas');

function runMw(mw, req) {
  return new Promise((resolve) => {
    mw(req, {}, (err) => resolve(err));
  });
}

tap.test('validate passes valid signup body', async (t) => {
  const req = { body: { name: 'A', email: 'a@b.com', password: 'secret12' } };
  const err = await runMw(validate(signupSchema), req);
  t.equal(err, undefined);
  t.end();
});

tap.test('validate rejects missing email with 400', async (t) => {
  const req = { body: { name: 'A', password: 'secret12' } };
  const err = await runMw(validate(signupSchema), req);
  t.ok(err);
  t.equal(err.statusCode, 400);
  t.end();
});
