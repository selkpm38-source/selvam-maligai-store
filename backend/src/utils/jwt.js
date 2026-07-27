/**
 * JWT helpers. Access tokens are short-lived and sent to the client;
 * refresh tokens are long-lived and stored in an httpOnly, secure,
 * environment-configured sameSite cookie — never accessible to client-side JS.
 */
'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

const REFRESH_COOKIE_NAME = 'refresh_token';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches default refresh expiry
  };
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
};
