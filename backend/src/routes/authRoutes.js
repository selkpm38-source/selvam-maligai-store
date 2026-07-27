'use strict';

const express = require('express');
const router = express.Router();

const { authLimiter } = require('../middlewares/security');
const {
  registerValidators,
  loginValidators,
  handleValidation,
} = require('../utils/validators');

const authController = require('../controllers/authController');

router.post(
  '/register',
  authLimiter,
  registerValidators,
  handleValidation,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  loginValidators,
  handleValidation,
  authController.login
);

router.post(
  '/refresh',
  authLimiter,
  authController.refresh
);

router.post(
  '/logout',
  authController.logout
);

module.exports = router;