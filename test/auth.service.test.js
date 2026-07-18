'use strict';
const tap = require('tap');
const { startTestDB, stopTestDB } = require('./helpers/setup');

tap.before(startTestDB);
tap.teardown(stopTestDB);

tap.test('signup hashes password, login returns token', async (t) => {
  const { signup, login } = require('../src/services/auth.service');
  const user = await signup({ name: 'C', email: 'c@d.com', password: 'secret12', preferences: ['x'] });
  t.equal(user.email, 'c@d.com');
  t.equal(user.password, undefined, 'no password in returned user');

  const { token } = await login({ email: 'c@d.com', password: 'secret12' });
  t.ok(token, 'token issued');
  t.end();
});

tap.test('login wrong password throws 401', async (t) => {
  const { login } = require('../src/services/auth.service');
  try {
    await login({ email: 'c@d.com', password: 'wrong' });
    t.fail('should have thrown');
  } catch (err) {
    t.equal(err.statusCode, 401);
  }
  t.end();
});

tap.test('signup duplicate email throws 409', async (t) => {
  const { signup } = require('../src/services/auth.service');
  try {
    await signup({ name: 'C', email: 'c@d.com', password: 'secret12' });
    t.fail('should have thrown');
  } catch (err) {
    t.equal(err.statusCode, 409);
  }
  t.end();
});
