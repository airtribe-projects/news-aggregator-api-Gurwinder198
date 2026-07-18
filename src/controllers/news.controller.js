'use strict';
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/respond');
const { getNews } = require('../services/news.service');
const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');

async function loadUser(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

const listNews = asyncHandler(async (req, res) => {
  const user = await loadUser(req.userId);
  const keywords = user.preferences.length ? user.preferences : ['general'];
  const news = await getNews(keywords);
  sendSuccess(res, 200, { news });
});

const searchNews = asyncHandler(async (req, res) => {
  const news = await getNews([req.params.keyword]);
  sendSuccess(res, 200, { news });
});

function snapshotFromBody(id, body = {}) {
  return {
    articleId: id,
    title: body.title,
    url: body.url,
    source: body.source,
    publishedAt: body.publishedAt,
    at: new Date(),
  };
}

const markRead = asyncHandler(async (req, res) => {
  const user = await loadUser(req.userId);
  const id = req.params.id;
  if (!user.readArticles.some((a) => a.articleId === id)) {
    user.readArticles.push(snapshotFromBody(id, req.body));
    await user.save();
  }
  sendSuccess(res, 200, { message: 'Article marked as read' });
});

const listRead = asyncHandler(async (req, res) => {
  const user = await loadUser(req.userId);
  sendSuccess(res, 200, { news: user.readArticles });
});

const markFavorite = asyncHandler(async (req, res) => {
  const user = await loadUser(req.userId);
  const id = req.params.id;
  if (!user.favorites.some((a) => a.articleId === id)) {
    user.favorites.push(snapshotFromBody(id, req.body));
    await user.save();
  }
  sendSuccess(res, 200, { message: 'Article marked as favorite' });
});

const listFavorites = asyncHandler(async (req, res) => {
  const user = await loadUser(req.userId);
  sendSuccess(res, 200, { news: user.favorites });
});

module.exports = {
  listNews, searchNews, markRead, listRead, markFavorite, listFavorites,
};
