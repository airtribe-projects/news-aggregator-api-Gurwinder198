'use strict';
const tap = require('tap');
const supertest = require('supertest');
const { startTestDB, stopTestDB } = require('./helpers/setup');
const app = require('../app');

const server = supertest(app);
tap.before(startTestDB);

const user = { name: 'Reader', email: 'reader@x.com', password: 'secret12', preferences: ['tech'] };
let token = '';

tap.test('setup: signup + login', async (t) => {
  await server.post('/users/signup').send(user);
  const res = await server.post('/users/login').send({ email: user.email, password: user.password });
  token = res.body.data.token;
  t.ok(token);
  t.end();
});

tap.test('every response uses the success envelope', async (t) => {
  const res = await server.get('/news').set('Authorization', `Bearer ${token}`);
  t.equal(res.status, 200);
  t.equal(res.body.success, true);
  t.hasOwnProp(res.body, 'data');
  t.hasOwnProp(res.body.data, 'news');
  t.end();
});

tap.test('error responses use the error envelope', async (t) => {
  const res = await server.get('/news'); // no token
  t.equal(res.status, 401);
  t.equal(res.body.success, false);
  t.ok(res.body.error.message);
  t.end();
});

tap.test('mark read then list read', async (t) => {
  const id = 'article-123';
  const post = await server.post(`/news/${encodeURIComponent(id)}/read`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Hello', url: 'http://z' });
  t.equal(post.status, 200);
  const list = await server.get('/news/read').set('Authorization', `Bearer ${token}`);
  t.equal(list.status, 200);
  t.equal(list.body.data.news.length, 1);
  t.equal(list.body.data.news[0].articleId, id);
  t.end();
});

tap.test('marking the same article read twice is idempotent', async (t) => {
  const id = 'article-123';
  await server.post(`/news/${encodeURIComponent(id)}/read`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Hello', url: 'http://z' });
  const list = await server.get('/news/read').set('Authorization', `Bearer ${token}`);
  t.equal(list.body.data.news.length, 1, 'no duplicate entry');
  t.end();
});

tap.test('mark favorite then list favorites', async (t) => {
  const id = 'article-999';
  const post = await server.post(`/news/${encodeURIComponent(id)}/favorite`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Fav', url: 'http://f' });
  t.equal(post.status, 200);
  const list = await server.get('/news/favorites').set('Authorization', `Bearer ${token}`);
  t.equal(list.body.data.news[0].articleId, id);
  t.end();
});

tap.test('search requires auth', async (t) => {
  const res = await server.get('/news/search/bitcoin');
  t.equal(res.status, 401);
  t.end();
});

tap.test('search returns the news envelope when authed', async (t) => {
  const res = await server.get('/news/search/bitcoin').set('Authorization', `Bearer ${token}`);
  t.equal(res.status, 200);
  t.equal(res.body.success, true);
  t.hasOwnProp(res.body.data, 'news');
  t.end();
});

tap.teardown(async () => {
  await stopTestDB();
  // Defer exit so tap can settle this async teardown before the process dies.
  setImmediate(() => process.exit(0));
});
