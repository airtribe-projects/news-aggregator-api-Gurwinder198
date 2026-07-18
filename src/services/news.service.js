'use strict';
const { cache, Cache } = require('./cache');
const { config } = require('../config/env');
const { logger } = require('../utils/logger');

const API_URL = 'https://eventregistry.org/api/v1/article/getArticles';

function normalize(article) {
  return {
    articleId: article.uri,
    title: article.title,
    url: article.url,
    source: article.source && article.source.title ? article.source.title : '',
    publishedAt: article.dateTimePub || article.date || '',
    description: article.body ? String(article.body).slice(0, 300) : '',
  };
}

function buildBody(keywords, apiKey) {
  return {
    action: 'getArticles',
    keyword: keywords,
    keywordOper: 'or',
    articlesCount: 20,
    resultType: 'articles',
    dataType: ['news'],
    apiKey,
  };
}

async function getNews(keywords, opts = {}) {
  const apiKey = opts.apiKey !== undefined ? opts.apiKey : config.news.apiKey;
  const ttlMs = opts.ttlMs !== undefined ? opts.ttlMs : config.cache.ttlMs;
  const fetchImpl = opts.fetchImpl || fetch;
  const store = opts.cache || cache;

  const list = Array.isArray(keywords) ? keywords : [keywords];
  const key = `news:${[...list].sort().join(',')}`;

  const fresh = store.get(key);
  if (fresh) return fresh;

  if (!apiKey) {
    logger.warn('No NewsAPI.ai key configured; returning empty news');
    return store.getStale(key) || [];
  }

  try {
    const res = await fetchImpl(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody(list, apiKey)),
    });
    if (!res.ok) {
      logger.warn({ status: res.status }, 'NewsAPI.ai non-OK response');
      return store.getStale(key) || [];
    }
    const data = await res.json();
    const results = (data.articles && data.articles.results) || [];
    const news = results.map(normalize);
    // A successful (even empty) response is cached for the full TTL to protect the
    // 2000 req/month quota; only failures skip the cache so they retry on next call.
    store.set(key, news, ttlMs);
    return news;
  } catch (err) {
    logger.warn({ err: err.message }, 'NewsAPI.ai fetch failed; using fallback');
    return store.getStale(key) || [];
  }
}

module.exports = { getNews, normalize, Cache };
