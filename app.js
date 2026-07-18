'use strict';
const express = require('express');
const helmet = require('helmet');
const usersRoutes = require('./src/routes/users.routes');
const newsRoutes = require('./src/routes/news.routes');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.get('/health', (_req, res) => res.status(200).json({ success: true, data: { status: 'ok' } }));
app.use('/users', usersRoutes);
app.use('/news', newsRoutes);

app.use((_req, res) => res.status(404).json({ success: false, error: { message: 'Not found' } }));
app.use(errorHandler);

module.exports = app;
