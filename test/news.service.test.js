'use strict';
process.env.NODE_ENV = 'test'; // keep the logger silent so unit output stays pristine
const tap = require('tap');
const { cache } = require('../src/services/cache');

function makeFetch(articles) {
  return async () => ({
    ok: true,
    status: 200,
    json: async () => ({ articles: { results: articles } }),
  });
}

tap.beforeEach(() => cache.clear());

tap.test('getNews normalizes articles', async (t) => {
  const { getNews } = require('../src/services/news.service');
  const raw = [{ uri: 'u1', title: 'T1', url: 'http://x', source: { title: 'S' }, dateTimePub: '2026-01-01' }];
  const news = await getNews(['movies'], { fetchImpl: makeFetch(raw), apiKey: 'k' });
  t.equal(news.length, 1);
  t.equal(news[0].articleId, 'u1');
  t.equal(news[0].title, 'T1');
  t.equal(news[0].source, 'S');
  t.end();
});

tap.test('getNews falls back to empty list on upstream error', async (t) => {
  const { getNews } = require('../src/services/news.service');
  const failing = async () => { throw new Error('network down'); };
  const news = await getNews(['movies'], { fetchImpl: failing, apiKey: 'k' });
  t.same(news, [], 'empty fallback, no throw');
  t.end();
});

tap.test('getNews returns stale cache on later failure', async (t) => {
  const { getNews } = require('../src/services/news.service');
  const raw = [{ uri: 'u2', title: 'T2', url: 'http://y', source: { title: 'S2' }, dateTimePub: '2026-01-02' }];
  await getNews(['tech'], { fetchImpl: makeFetch(raw), apiKey: 'k', ttlMs: 5 });
  await new Promise((r) => setTimeout(r, 15));
  const failing = async () => { throw new Error('down'); };
  const news = await getNews(['tech'], { fetchImpl: failing, apiKey: 'k' });
  t.equal(news[0].articleId, 'u2', 'served stale');
  t.end();
});

tap.test('getNews returns empty when no apiKey', async (t) => {
  const { getNews } = require('../src/services/news.service');
  const news = await getNews(['movies'], { apiKey: '' });
  t.same(news, []);
  t.end();
});

tap.test('getNews falls back to empty list on non-OK (e.g. 429) response', async (t) => {
  const { getNews } = require('../src/services/news.service');
  const rateLimited = async () => ({
    ok: false,
    status: 429,
    json: async () => { throw new Error('should not read body on non-OK'); },
  });
  const news = await getNews(['movies'], { fetchImpl: rateLimited, apiKey: 'k' });
  t.same(news, [], 'empty fallback on non-OK, no throw');
  t.end();
});

tap.test('getNews serves stale cache on non-OK response', async (t) => {
  const { getNews } = require('../src/services/news.service');
  const raw = [{ uri: 'u3', title: 'T3', url: 'http://z', source: { title: 'S3' }, dateTimePub: '2026-01-03' }];
  await getNews(['sports'], { fetchImpl: makeFetch(raw), apiKey: 'k', ttlMs: 5 });
  await new Promise((r) => setTimeout(r, 15));
  const rateLimited = async () => ({ ok: false, status: 429, json: async () => ({}) });
  const news = await getNews(['sports'], { fetchImpl: rateLimited, apiKey: 'k' });
  t.equal(news[0].articleId, 'u3', 'served stale on non-OK');
  t.end();
});

tap.test('getNews sends a well-formed request to the NewsAPI.ai endpoint', async (t) => {
  const { getNews } = require('../src/services/news.service');
  let capturedUrl;
  let capturedInit;
  const capturingFetch = async (url, init) => {
    capturedUrl = url;
    capturedInit = init;
    return { ok: true, status: 200, json: async () => ({ articles: { results: [] } }) };
  };
  await getNews(['tech', 'movies'], { fetchImpl: capturingFetch, apiKey: 'my-key' });
  t.equal(capturedUrl, 'https://eventregistry.org/api/v1/article/getArticles');
  t.equal(capturedInit.method, 'POST');
  t.equal(capturedInit.headers['Content-Type'], 'application/json');
  const body = JSON.parse(capturedInit.body);
  t.same(body.keyword, ['tech', 'movies'], 'keywords passed through');
  t.equal(body.keywordOper, 'or');
  t.equal(body.articlesCount, 20, 'uses camelCase articlesCount so the count limit is honored');
  t.equal(body.resultType, 'articles');
  t.same(body.dataType, ['news']);
  t.equal(body.apiKey, 'my-key');
  t.end();
});
