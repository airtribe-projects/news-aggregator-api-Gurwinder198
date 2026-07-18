'use strict';
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
