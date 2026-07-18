'use strict';
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/users.controller');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { signupSchema, loginSchema, preferencesSchema } = require('../validation/schemas');

router.post('/signup', validate(signupSchema), ctrl.signup);
router.post('/login', validate(loginSchema), ctrl.login);
router.get('/preferences', auth, ctrl.getPreferences);
router.put('/preferences', auth, validate(preferencesSchema), ctrl.updatePreferences);

module.exports = router;
