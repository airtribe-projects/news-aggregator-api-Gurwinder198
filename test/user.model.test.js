'use strict';
const tap = require('tap');
const { startTestDB, stopTestDB } = require('./helpers/setup');

tap.before(startTestDB);
tap.teardown(stopTestDB);

tap.test('User hides password on toJSON and defaults arrays', async (t) => {
  const User = require('../src/models/User');
  const u = await User.create({
    name: 'A', email: 'A@Example.com', password: 'hash',
  });
  t.equal(u.email, 'a@example.com', 'email lowercased');
  t.same(u.preferences, []);
  t.same(u.readArticles, []);
  const json = u.toJSON();
  t.equal(json.password, undefined, 'password not serialized');
  t.end();
});
