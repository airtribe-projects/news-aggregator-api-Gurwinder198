'use strict';
const tap = require('tap');
const { Cache } = require('../src/services/cache');

tap.test('cache returns value before TTL, undefined after', async (t) => {
  const c = new Cache();
  c.set('k', [1, 2], 50);
  t.same(c.get('k'), [1, 2]);
  await new Promise((r) => setTimeout(r, 70));
  t.equal(c.get('k'), undefined, 'expired');
  t.end();
});

tap.test('cache getStale returns value even after expiry', async (t) => {
  const c = new Cache();
  c.set('k', [9], 10);
  await new Promise((r) => setTimeout(r, 30));
  t.equal(c.get('k'), undefined);
  t.same(c.getStale('k'), [9], 'stale still available');
  t.end();
});
