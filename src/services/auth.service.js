'use strict';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { config } = require('../config/env');
const { ApiError } = require('../utils/ApiError');

const SALT_ROUNDS = 10;

async function signup({ name, email, password, preferences = [] }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'Email already registered');
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    const user = await User.create({ name, email, password: hash, preferences });
    return user.toJSON();
  } catch (err) {
    // The unique index is the real guarantee: a concurrent signup can slip past
    // the findOne check above, so translate the duplicate-key error to 409 too.
    if (err && err.code === 11000) throw new ApiError(409, 'Email already registered');
    throw err;
  }
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new ApiError(401, 'Invalid credentials');
  const token = jwt.sign({ userId: user._id.toString() }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
  return { token };
}

module.exports = { signup, login };
