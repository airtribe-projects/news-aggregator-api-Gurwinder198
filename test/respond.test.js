'use strict';
const tap = require('tap');
const { sendSuccess } = require('../src/utils/respond');

function fakeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

tap.test('sendSuccess wraps data in success envelope', async (t) => {
  const res = fakeRes();
  sendSuccess(res, 200, { token: 'abc' });
  t.equal(res.statusCode, 200);
  t.same(res.body, { success: true, data: { token: 'abc' } });
  t.end();
});

tap.test('sendSuccess defaults status to 200', async (t) => {
  const res = fakeRes();
  sendSuccess(res, undefined, { ok: 1 });
  t.equal(res.statusCode, 200);
  t.equal(res.body.success, true);
  t.end();
});
