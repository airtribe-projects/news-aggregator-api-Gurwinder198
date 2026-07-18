'use strict';
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/news.controller');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', ctrl.listNews);
router.get('/read', ctrl.listRead);
router.get('/favorites', ctrl.listFavorites);
router.get('/search/:keyword', ctrl.searchNews);
router.post('/:id/read', ctrl.markRead);
router.post('/:id/favorite', ctrl.markFavorite);

module.exports = router;
