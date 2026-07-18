'use strict';
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/respond');
const authService = require('../services/auth.service');
const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');

const signup = asyncHandler(async (req, res) => {
  const user = await authService.signup(req.body);
  sendSuccess(res, 200, { user });
});

const login = asyncHandler(async (req, res) => {
  const { token } = await authService.login(req.body);
  sendSuccess(res, 200, { token });
});

const getPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, 'User not found');
  sendSuccess(res, 200, { preferences: user.preferences });
});

const updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.userId,
    { preferences: req.body.preferences },
    { new: true }
  );
  if (!user) throw new ApiError(404, 'User not found');
  sendSuccess(res, 200, { preferences: user.preferences });
});

module.exports = { signup, login, getPreferences, updatePreferences };
